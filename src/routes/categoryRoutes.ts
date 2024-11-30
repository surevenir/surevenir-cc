import express from "express";
import CategoryController from "../controllers/categoryController";
import authorizeAdmin from "../middlewares/authorizeAdmin";
import authenticate from "../middlewares/authenticate";
import multer from "../middlewares/multer";

const marketRouter = express.Router();

marketRouter.get("/", authenticate, CategoryController.getAllCategories);
marketRouter.get("/:id", authenticate, CategoryController.getCategoryById);
marketRouter.post(
  "/",
  authenticate,
  authorizeAdmin,
  multer.single("image"),
  CategoryController.createCategory
);
marketRouter.patch(
  "/:id",
  authenticate,
  authorizeAdmin,
  multer.single("image"),
  CategoryController.updateCategory
);
marketRouter.delete(
  "/:id",
  authenticate,
  authorizeAdmin,
  CategoryController.deleteCategory
);

export default marketRouter;
