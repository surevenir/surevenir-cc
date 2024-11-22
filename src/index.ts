import express, { Request, Response } from "express";
import userRoutes from "./routes/userRoutes";
import marketRoutes from "./routes/marketRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import merchantRoutes from "./routes/merchantRoutes";
import productRoutes from "./routes/productRoutes";
import reviewRoutes from "./routes/reviewRoutes";
import cartRoutes from "./routes/cartRoutes";
import errorHandler from "./middlewares/errorHandler";
import './types/global/authUser';
import multer from "./middlewares/multer";
import MediaService from "./services/mediaService";

const app = express();
const PORT = process.env.PORT || 3000;

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

app.post("/api/upload", multer.array("images", 10),(req: Request, res: Response) => {
  const mediaService = new MediaService();
  const files = req.files as Express.Multer.File[];
});


app.use(errorHandler as any);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
