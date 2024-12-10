import express from "express";
import CartController from "../controllers/cartController";
import authenticate from "../middlewares/authenticate";
import authorizeAdmin from "../middlewares/authorizeAdmin";

const cartRouter = express.Router();

cartRouter.post("/", authenticate, CartController.addproductToCart);
cartRouter.get("/", authenticate, CartController.getProductsInCart);
cartRouter.patch("/:id", authenticate, CartController.updateProductInCart);
cartRouter.delete("/:id", authenticate, CartController.deleteCartItem);
cartRouter.delete("/", authenticate, CartController.deleteAllProductsInCart);
cartRouter.post("/checkout", authenticate, CartController.checkout);
cartRouter.patch(
  "/checkout/:id/status",
  authenticate,
  authorizeAdmin,
  CartController.updateCheckoutStatus
);
cartRouter.get("/checkout", authenticate, CartController.getCheckouts);
cartRouter.get("/checkout/all", authenticate, CartController.getAllCheckouts);

export default cartRouter;
