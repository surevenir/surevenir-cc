import express from "express";
import ProductController from "../controllers/productController";
import authorizeAdmin from "../middlewares/authorizeAdmin";
import authenticate from "../middlewares/authenticate";
import multer from "../middlewares/multer";
import cacheMiddleware from "../middlewares/cacheMiddleware";

const productRouter = express.Router();

productRouter.get(
  "/",
  authenticate,
  cacheMiddleware,
  ProductController.getAllProducts
);
productRouter.get(
  "/slug/:slug",
  authenticate,
  ProductController.getProductBySlug
);
productRouter.get(
  "/top-favorites",
  authenticate,
  cacheMiddleware,
  ProductController.getTopFavoritedProducts
);
productRouter.get(
  "/favorites",
  authenticate,
  cacheMiddleware,
  ProductController.getFavoritedProducts
);
productRouter.get(
  "/:id",
  authenticate,
  cacheMiddleware,
  ProductController.getProductById
);
productRouter.get(
  "/by/owner",
  authenticate,
  ProductController.getAllProductsByOwner
);
productRouter.get(
  "/:id/reviews",
  authenticate,
  cacheMiddleware,
  ProductController.getProductReviews
);
productRouter.post(
  "/:id/images",
  authenticate,
  authorizeAdmin,
  multer.array("images", 10),
  ProductController.addProductImages
);
productRouter.post(
  "/:id/favorites",
  authenticate,
  ProductController.addProductToFavorite
);
productRouter.delete(
  "/:id/favorites",
  authenticate,
  ProductController.deleteProductFromFavorite
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
