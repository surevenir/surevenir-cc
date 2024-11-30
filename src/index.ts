import express, { Request, Response } from "express";
import userRoutes from "./routes/userRoutes";
import marketRoutes from "./routes/marketRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import merchantRoutes from "./routes/merchantRoutes";
import productRoutes from "./routes/productRoutes";
import reviewRoutes from "./routes/reviewRoutes";
import cartRoutes from "./routes/cartRoutes";
import mediaRoutes from "./routes/mediaRoutes";
import errorHandler from "./middlewares/errorHandler";
import "./types/global/authUser";
import multer from "./middlewares/multer";
import MediaService from "./services/mediaService";
import prisma from "./config/database";

const app = express();
const PORT = process.env.PORT || 5000;

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, TypeScript with Express!");
});

app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/markets", marketRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/merchants", merchantRoutes);
app.use("/api/products", productRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/carts", cartRoutes);
app.use("/api/images", mediaRoutes);

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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
