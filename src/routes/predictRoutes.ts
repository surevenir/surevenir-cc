import express from "express";
import authenticate from "../middlewares/authenticate";
import multer from "../middlewares/multer";
import predictController from "../controllers/predictController";
import cacheMiddleware from "../middlewares/cacheMiddleware";

const predictRouter = express.Router();

predictRouter.get(
  "/top-scanner",
  authenticate,
  cacheMiddleware,
  predictController.getTopScanner
);
predictRouter.post(
  "/",
  authenticate,
  multer.single("image"),
  predictController.predict
);
predictRouter.get(
  "/histories/me",
  authenticate,
  predictController.getUserHistories
);
predictRouter.delete(
  "/history/:id",
  authenticate,
  predictController.deleteHistory
);

export default predictRouter;
