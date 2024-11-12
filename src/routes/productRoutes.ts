import express from "express";
import ProductController from "../controllers/productController";
import authorizeAdmin from "../middlewares/authorizeAdmin";
import authenticate from "../middlewares/authenticate";

const productRouter = express.Router();

productRouter.get("/", authenticate, ProductController.getProductByQuery);
productRouter.get("/:id", authenticate, ProductController.getProductById);
productRouter.post(
  "/",
  authenticate,
  authorizeAdmin,
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
