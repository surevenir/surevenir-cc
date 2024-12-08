import { Request, Response, NextFunction } from "express";
import createResponse from "../utils/createResponse";
import {
  AddProductsToCartRequest,
  UpdateProductInCartRequest,
  CheckoutRequest,
  UpdateCheckoutStatusRequest,
} from "../types/request/cartRequest";
import Controller from "../utils/controllerDecorator";
import CartService from "../services/cartService";
import { CheckoutStatus, PubSubTopic } from "../types/enum/dbEnum";
import { publishMessage } from "../config/pubSubClient";

@Controller
class CartController {
  private cartService: CartService;

  constructor() {
    this.cartService = new CartService();
  }

  async addproductToCart(req: Request, res: Response, next: NextFunction) {
    const data = AddProductsToCartRequest.parse(req.body);
    const result = await this.cartService.addproductToCart(
      req.user!,
      data.product_id,
      data.quantity
    );
    createResponse(res, 200, "Product added to cart", result);
  }

  async updateProductInCart(req: Request, res: Response, next: NextFunction) {
    const id = req.params.id;
    const data = UpdateProductInCartRequest.parse(req.body);
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
    const data = CheckoutRequest.parse(req.body);
    const productIds = data.product_ids as number[];
    const result = await this.cartService.checkout(req.user!, productIds);

    const message = `User ${req.user?.full_name} has checked out.`;
    const attributes = {
      eventType: "CHECKOUT",
      source: "checkoutService",
      userId: req.user?.id?.toString() || "unknown",
      userName: req.user?.full_name || "unknown",
      productIds: JSON.stringify(productIds),
      priority: "high",
      timestamp: new Date().toISOString(),
    };

    const messageId = await publishMessage(
      message,
      PubSubTopic.CHECKOUT,
      attributes
    );
    console.log(`Pesan berhasil dikirim dengan ID: ${messageId}`);

    createResponse(res, 200, "Checkout successful", result);
  }

  async updateCheckoutStatus(req: Request, res: Response, next: NextFunction) {
    const data = UpdateCheckoutStatusRequest.parse(req.body);
    const { id } = req.params;
    const status = data.status;
    const result = await this.cartService.updateCheckoutStatus(
      parseInt(id),
      status
    );

    const message = `Checkout status for order ID ${id} updated to ${status}.`;
    const attributes = {
      eventType: "CHECKOUT_STATUS_UPDATE",
      source: "checkoutService",
      userId: req.user?.id?.toString() || "unknown",
      userName: req.user?.full_name || "unknown",
      orderId: id,
      newStatus: status,
      priority: "normal",
      timestamp: new Date().toISOString(),
    };

    const messageId = await publishMessage(
      message,
      PubSubTopic.UPDATE_CHECKOUT_STATUS,
      attributes
    );
    console.log(`Pesan berhasil dikirim dengan ID: ${messageId}`);

    createResponse(res, 200, "Checkout status updated", result);
  }

  async getCheckouts(req: Request, res: Response, next: NextFunction) {
    const result = await this.cartService.getCheckouts(req.user!);
    createResponse(res, 200, "Checkouts fetched", result);
  }
}

export default new CartController();
