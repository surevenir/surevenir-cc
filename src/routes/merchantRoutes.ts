import express from "express";
import MerchantController from "../controllers/merchantController";
import authorizeAdmin from "../middlewares/authorizeAdmin";
import authenticate from "../middlewares/authenticate";
import multer from "../middlewares/multer";
import cacheMiddleware from "../middlewares/cacheMiddleware";

const merchantRouter = express.Router();

merchantRouter.get(
  "/",
  authenticate,
  cacheMiddleware,
  MerchantController.getAllMerchants
);
merchantRouter.get(
  "/by/owner",
  authenticate,
  MerchantController.getAllMerchantsByOwner
);
merchantRouter.get(
  "/:id",
  authenticate,
  cacheMiddleware,
  MerchantController.getMerchantById
);
merchantRouter.get(
  "/slug/:slug",
  authenticate,
  MerchantController.getMerchantBySlug
);
merchantRouter.get(
  "/:id/products",
  authenticate,
  cacheMiddleware,
  MerchantController.getProductsInMerchant
);
merchantRouter.post(
  "/:id/images",
  authenticate,
  authorizeAdmin,
  multer.array("images", 10),
  MerchantController.addMerchantImages
);
merchantRouter.post(
  "/",
  authenticate,
  authorizeAdmin,
  multer.single("image"),
  MerchantController.createMerchant
);
merchantRouter.patch(
  "/:id",
  authenticate,
  authorizeAdmin,
  multer.single("image"),
  MerchantController.updateMerchant
);
merchantRouter.delete(
  "/:id",
  authenticate,
  authorizeAdmin,
  MerchantController.deleteMerchant
);

export default merchantRouter;
