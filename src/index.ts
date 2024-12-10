import express, { Request, Response } from "express";
import userRoutes from "./routes/userRoutes";
import marketRoutes from "./routes/marketRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import merchantRoutes from "./routes/merchantRoutes";
import productRoutes from "./routes/productRoutes";
import reviewRoutes from "./routes/reviewRoutes";
import cartRoutes from "./routes/cartRoutes";
import predictRoutes from "./routes/predictRoutes";
import mediaRoutes from "./routes/mediaRoutes";
import errorHandler from "./middlewares/errorHandler";
import "./types/global/authUser";
import multer from "./middlewares/multer";
import MediaService from "./services/mediaService";
import prisma from "./config/database";
import { connectRedis, redisClient } from "./config/redis";
import "./utils/validateEnv";

const app = express();
const PORT = process.env.PORT || 8080;
const FRONTEND_URL = process.env.FRONTEND_URL || "";

if (process.env.WITH_CACHING === "true") {
  connectRedis();
}
redisClient.on("connect", () => {
  console.log("Connected to Redis!");
});
redisClient.on("error", (err) => {
  console.error("Redis Client Error:", err);
});

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, TypeScript with Express!");
});

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", FRONTEND_URL);
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/api/users", userRoutes);
app.use("/api/markets", marketRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/merchants", merchantRoutes);
app.use("/api/products", productRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/carts", cartRoutes);
app.use("/api/images", mediaRoutes);
app.use("/api/predict", predictRoutes);

app.post(
  "/api/upload",
  multer.array("images", 10),
  (req: Request, res: Response) => {
    const mediaService = new MediaService();
    const files = req.files as Express.Multer.File[];
  }
);

app.get("/api/count", async (req: Request, res: Response) => {
  try {
    const usersCount = await prisma.user.count();
    const marketsCount = await prisma.market.count();
    const merchantsCount = await prisma.merchant.count();
    const productsCount = await prisma.product.count();

    res.status(200).json({
      success: true,
      status_code: 200,
      message: "Data statistics retrieved successfully",
      data: [
        { users: usersCount },
        { markets: marketsCount },
        { merchants: merchantsCount },
        { products: productsCount },
      ],
    });
  } catch (error) {
    console.error("Error retrieving counts:", error);
    res.status(500).json({
      success: false,
      status_code: 500,
      message: "Failed to retrieve data statistics",
    });
  }
});

let clients: any = [];

app.get("/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  clients.push(res);

  req.on("close", () => {
    clients = clients.filter((client: any) => client !== res);
  });

  req.on("error", (err) => {
    console.error("Connection error:", err);
  });
});

app.post("/pubsub-handler", (req, res) => {
  const message = req.body?.message;

  if (message?.data) {
    const data = Buffer.from(message.data, "base64").toString("utf-8");
    console.log(`Received message: ${data}`);

    clients.forEach((client: any) => client.write(`data: ${data}\n\n`));
  } else {
    console.error("Invalid message format");
  }

  res.status(200).send();
});

app.use(errorHandler as any);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
