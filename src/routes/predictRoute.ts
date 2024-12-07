import express from "express";
import authenticate from "../middlewares/authenticate";
import multer from "../middlewares/multer";
import predictController from "../controllers/predictController";

const predictRouter = express.Router();

predictRouter.post(
  "/",
  authenticate,
  multer.single("image"),
  predictController.predict
);
predictRouter.get("/histories/me", authenticate, predictController.getUserHistories);

export default predictRouter;
