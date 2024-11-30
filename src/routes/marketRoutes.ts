import express from "express";
import MarketController from "../controllers/marketController";
import authorizeAdmin from "../middlewares/authorizeAdmin";
import authenticate from "../middlewares/authenticate";
import multer from "../middlewares/multer";

const marketRouter = express.Router();

marketRouter.get("/", authenticate, MarketController.getAllMarkets);
marketRouter.get("/:id", authenticate, MarketController.getMarketById);
marketRouter.get(
  "/:id/merchants",
  authenticate,
  MarketController.getMerchantsInMarket
);
marketRouter.post(
  "/:id/images",
  authenticate,
  authorizeAdmin,
  multer.array("images", 10),
  MarketController.addMarketImages
);
marketRouter.post(
  "/",
  authenticate,
  authorizeAdmin,
  multer.single("image"),
  MarketController.createMarket
);
marketRouter.patch(
  "/:id",
  authenticate,
  authorizeAdmin,
  multer.single("image"),
  MarketController.updateMarket
);

marketRouter.delete(
  "/:id",
  authenticate,
  authorizeAdmin,
  MarketController.deleteMarket
);

export default marketRouter;
