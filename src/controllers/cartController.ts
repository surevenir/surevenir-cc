import { Request, Response, NextFunction } from "express";
import createResponse from "../utils/createResponse";
import { AddProductsToCart, UpdateProductInCart } from "../types/request/cart";
import Controller from "../utils/controllerDecorator";
import CartService from "../services/cartService";

@Controller
class CartController {
  private cartService: CartService;

  constructor() {
    this.cartService = new CartService();
  }

  async addproductToCart(req: Request, res: Response, next: NextFunction) {
    const data = AddProductsToCart.parse(req.body);
    const result = await this.cartService.addproductToCart(
      req.user!,
      data.product_id,
      data.quantity
    );
    createResponse(res, 200, "Product added to cart", result);
  }

  async updateProductInCart(req: Request, res: Response, next: NextFunction) {
    const id = req.params.id;
    const data = UpdateProductInCart.parse(req.body);
    const result = await this.cartService.updateProductInCart(
      req.user!,
      parseInt(id),
      data.quantity
    );
    createResponse(res, 200, "Product updated in cart", result);
  }

  async getProductsInCart(req: Request, res: Response, next: NextFunction) {
    const result = await this.cartService.getProductsInCart(req.user!);
    createResponse(res, 200, "Cart fetched", result);
  }

  async deleteCartItem(req: Request, res: Response, next: NextFunction) {
    const cartId = parseInt(req.params.id);
    const result = await this.cartService.deleteCartItem(req.user!, cartId);
    createResponse(res, 200, "Product deleted from cart", result);
  }

  async deleteAllProductsInCart(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const result = await this.cartService.deleteAllProductsInCart(req.user!);
    createResponse(res, 200, "All products deleted from cart", result);
  }

  async checkout(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const productIds = req.body.product_ids as number[];
    const result = await this.cartService.checkout(
      req.user!,
      parseInt(id),
      productIds
    );
    createResponse(res, 200, "Checkout successful", result);
  }
}

export default new CartController();
