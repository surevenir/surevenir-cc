import express from "express";
import ImageController from "../controllers/imageController";
import authorizeAdmin from "../middlewares/authorizeAdmin";
import authenticate from "../middlewares/authenticate";

const imageRouter = express.Router();

imageRouter.get("/", authenticate, ImageController.getAllImages);
imageRouter.get("/:id", authenticate, ImageController.getImageById);
imageRouter.post(
  "/",
  authenticate,
  authorizeAdmin,
  ImageController.createImage
);
imageRouter.patch(
  "/:id",
  authenticate,
  authorizeAdmin,
  ImageController.updateImage
);
imageRouter.delete(
  "/:id",
  authenticate,
  authorizeAdmin,
  ImageController.deleteImage
);

export default imageRouter;
