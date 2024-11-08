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
// marketRouter.patch("/users/:id", authenticate, UserController.updateUser);
// marketRouter.delete("/users/:id", authenticate, UserController.deleteUser);

export default marketRouter;
