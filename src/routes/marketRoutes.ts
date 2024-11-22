import express from "express";
import MarketController from "../controllers/marketController";
import authorizeAdmin from "../middlewares/authorizeAdmin";
import authenticate from "../middlewares/authenticate";

const marketRouter = express.Router();

marketRouter.get("/", authenticate, MarketController.getAllMarkets);
marketRouter.get("/:id", authenticate, MarketController.getMarketById);
marketRouter.post(
  "/",
  authenticate,
  authorizeAdmin,
  MarketController.createMarket
);
marketRouter.patch(
  "/:id",
  authenticate,
  authorizeAdmin,
  MarketController.updateMarket
);
marketRouter.delete(
  "/:id",
  authenticate,
  authorizeAdmin,
  MarketController.deleteMarket
);

export default marketRouter;
