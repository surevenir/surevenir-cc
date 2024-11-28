import express from "express";
import CartController from "../controllers/cartController";
import authenticate from "../middlewares/authenticate";

const cartRouter = express.Router();

cartRouter.post("/", authenticate, CartController.addproductToCart);


export default cartRouter;
