import express from "express";
import ProductController from "../controllers/productController";
import authorizeAdmin from "../middlewares/authorizeAdmin";
import authenticate from "../middlewares/authenticate";
import multer from "../middlewares/multer";

const productRouter = express.Router();

productRouter.get("/", authenticate, ProductController.getAllProducts);
productRouter.get("/:id", authenticate, ProductController.getProductById);
productRouter.get(
  "/:id/reviews",
  authenticate,
  ProductController.getProductReviews
);
productRouter.post(
  "/",
  authenticate,
  authorizeAdmin,
  multer.array("images", 10),
  ProductController.createProduct
);
productRouter.patch(
  "/:id",
  authenticate,
  authorizeAdmin,
  ProductController.updateProduct
);
productRouter.delete(
  "/:id",
  authenticate,
  authorizeAdmin,
  ProductController.deleteProduct
);

export default productRouter;
