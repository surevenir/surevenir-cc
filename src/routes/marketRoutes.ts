import express from "express";
import MarketController from "../controllers/marketController";
import authorizeAdmin from "../middlewares/authorizeAdmin";
import authenticate from "../middlewares/authenticate";

const router = express.Router();

router.get("/markets", authenticate, MarketController.getAllMarkets);

router.post(
  "/markets",
  authenticate,
  authorizeAdmin,
  MarketController.createMarket
);
// router.patch("/users/:id", authenticate, UserController.updateUser);
// router.delete("/users/:id", authenticate, UserController.deleteUser);

export default router;
