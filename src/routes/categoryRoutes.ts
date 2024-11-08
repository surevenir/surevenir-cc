import express from "express";
import CategoryController from "../controllers/categoryController";
import authorizeAdmin from "../middlewares/authorizeAdmin";
import authenticate from "../middlewares/authenticate";

const marketRouter = express.Router();

marketRouter.get("/", authenticate, CategoryController.getAllCategories);
marketRouter.get("/:id", authenticate, CategoryController.getCategoryById);
marketRouter.post(
  "/",
  authenticate,
  authorizeAdmin,
  CategoryController.createCategory
);
marketRouter.patch(
  "/:id",
  authenticate,
  authorizeAdmin,
  CategoryController.updateCategory
);
marketRouter.delete(
  "/:id",
  authenticate,
  authorizeAdmin,
  CategoryController.deleteCategory
);

export default marketRouter;
