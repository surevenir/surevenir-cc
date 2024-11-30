import express from "express";
import MediaController from "../controllers/mediaController";
import authorizeAdmin from "../middlewares/authorizeAdmin";
import authenticate from "../middlewares/authenticate";

const mediaRouter = express.Router();

mediaRouter.delete(
  "/",
  authenticate,
  authorizeAdmin,
  MediaController.deleteMedia
);

export default mediaRouter;
