import express, { Request, Response } from "express";
import userRoutes from "./routes/userRoutes";
import marketRoutes from "./routes/marketRoutes";
import errorHandler from "./middlewares/errorHandler";
import { User } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: User | null;
    }
  }
}

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, TypeScript with Express!");
});

app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/markets", marketRoutes);

app.use(errorHandler as any);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
