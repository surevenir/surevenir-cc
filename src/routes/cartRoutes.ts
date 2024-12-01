import express from "express";
import CartController from "../controllers/cartController";
import authenticate from "../middlewares/authenticate";

const cartRouter = express.Router();

cartRouter.post("/", authenticate, CartController.addproductToCart);
cartRouter.get("/", authenticate, CartController.getProductsInCart);
cartRouter.patch("/:id", authenticate, CartController.updateProductInCart);
cartRouter.delete("/:id", authenticate, CartController.deleteCartItem);
cartRouter.delete("/", authenticate, CartController.deleteAllProductsInCart);
cartRouter.post("/:id/checkout", authenticate, CartController.checkout);
cartRouter.put("/checkout/:id/status", authenticate, CartController.updateCheckoutStatus);

export default cartRouter;
