import express from "express";
import ProductCategoryController from "../controllers/productCategoryController";
import authorizeAdmin from "../middlewares/authorizeAdmin";
import authenticate from "../middlewares/authenticate";

const productCategoryRouter = express.Router();

productCategoryRouter.get(
  "/",
  authenticate,
  ProductCategoryController.getAllProductCategories
);
productCategoryRouter.get(
  "/:id",
  authenticate,
  ProductCategoryController.getProductCategoryById
);
productCategoryRouter.post(
  "/",
  authenticate,
  authorizeAdmin,
  ProductCategoryController.createProductCategory
);
productCategoryRouter.patch(
  "/:id",
  authenticate,
  authorizeAdmin,
  ProductCategoryController.updateProductCategory
);
productCategoryRouter.delete(
  "/:id",
  authenticate,
  authorizeAdmin,
  ProductCategoryController.deleteProductCategory
);

export default productCategoryRouter;
