import express, { Request, Response } from "express";
import { createServer } from "http";
import userRoutes from "./routes/userRoutes";
import WebSocket, { WebSocketServer } from "ws";
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
import "./utils/validateEnv";
import { pubSubClient } from "./utils/pubSubClient";

const app = express();
const PORT = process.env.PORT || 8080;
const FRONTEND_URL = process.env.FRONTEND_URL || "";

// Buat HTTP server dan WebSocket server
const server = createServer(app);
const wss = new WebSocketServer({ server });

let recentMessages: { id: string; data: string; attributes: object }[] = [];
const subscriptionName = process.env.SUBSCRIPTION_NAME as string;
const subscription = pubSubClient.subscription(subscriptionName);

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

// WebSocket Connection Management
wss.on("connection", (ws: any) => {
  console.log("New WebSocket connection established");

  ws.on("close", () => {
    console.log("WebSocket connection closed");
  });

  ws.on("error", (error: any) => {
    console.error("WebSocket error:", error);
  });
});

// Pub/Sub Subscription
subscription.on("message", (message: any) => {
  console.log(`\nReceived message:`);
  console.log(`  ID: ${message.id}`);
  console.log(`  Data: ${message.data.toString()}`);
  console.log(`  Attributes: ${JSON.stringify(message.attributes)}`);

  // Simpan pesan terbaru
  recentMessages.push({
    id: message.id,
    data: message.data.toString(),
    attributes: message.attributes,
  });

  if (recentMessages.length > 100) {
    recentMessages.shift(); // Batasi jumlah pesan yang disimpan
  }

  // Kirim pesan ke semua klien WebSocket
  wss.clients.forEach((client: any) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          id: message.id,
          data: message.data.toString(),
          attributes: message.attributes,
        })
      );
    }
  });

  // Acknowledge the message
  message.ack();
  console.log(`  Message acknowledged.`);
});

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

app.use(errorHandler as any);

// Jalankan server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
