import express from "express";
import CartController from "../controllers/cartController";
import authorizeAdmin from "../middlewares/authorizeAdmin";
import authenticate from "../middlewares/authenticate";

const cartRouter = express.Router();

cartRouter.get("/", authenticate, CartController.getAllCarts);
cartRouter.get("/:id", authenticate, CartController.getCartById);
cartRouter.post("/", authenticate, CartController.createCart);
cartRouter.patch("/:id", authenticate, CartController.updateCart);
cartRouter.delete("/:id", authenticate, CartController.deleteCart);

export default cartRouter;
