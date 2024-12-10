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
import { PubSubTopic } from "../types/enum/dbEnum";
import { publishMessage } from "../config/pubSubClient";

@Controller
class CartController {
  private cartService: CartService;

  /**
   * Initializes an instance of CartController.
   * Sets up the cart service to handle cart-related operations.
   */
  constructor() {
    this.cartService = new CartService();
  }

  /**
   * Adds a product to a user's cart.
   * @param req The incoming request which must contain the user and a body with product_id and quantity.
   * @param res The response to the request.
   * @param next The callback to call when the middleware is done.
   */
  async addproductToCart(req: Request, res: Response, next: NextFunction) {
    const data = AddProductsToCartRequest.parse(req.body);
    const result = await this.cartService.addproductToCart(
      req.user!,
      data.product_id,
      data.quantity
    );
    createResponse(res, 200, "Product added to cart", result);
  }

  /**
   * Updates the quantity of a product in a user's cart.
   * @param req The incoming request which must contain the user, a body with quantity, and a param with the cart id.
   * @param res The response to the request.
   * @param next The callback to call when the middleware is done.
   */
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

  /**
   * Retrieves the products in a user's cart.
   * @param req The incoming request which must contain the user.
   * @param res The response containing the cart and total price.
   * @param next The callback to call when the middleware is done.
   */
  async getProductsInCart(req: Request, res: Response, next: NextFunction) {
    const result = await this.cartService.getProductsInCart(req.user!);
    createResponse(res, 200, "Cart fetched", result);
  }

  /**
   * Deletes a product from a user's cart.
   * @param req The incoming request which must contain the user and a param with the cart id.
   * @param res The response to the request.
   * @param next The callback to call when the middleware is done.
   */
  async deleteCartItem(req: Request, res: Response, next: NextFunction) {
    const cartId = parseInt(req.params.id);
    const result = await this.cartService.deleteCartItem(req.user!, cartId);
    createResponse(res, 200, "Product deleted from cart", result);
  }

  /**
   * Deletes all products from a user's cart.
   * @param req The incoming request which must contain the user.
   * @param res The response to the request.
   * @param next The callback to call when the middleware is done.
   */
  async deleteAllProductsInCart(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const result = await this.cartService.deleteAllProductsInCart(req.user!);
    createResponse(res, 200, "All products deleted from cart", result);
  }

  /**
   * Performs a checkout for a user. This will create a checkout entity in the database.
   * @param req The incoming request which must contain the user and a body with product ids.
   * @param res The response to the request.
   * @param next The callback to call when the middleware is done.
   */
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

  /**
   * Updates the status of a checkout order.
   *
   * This function parses the request body to retrieve the new status for a checkout order and the order ID from the request parameters.
   * It updates the checkout status in the database using the cart service, then sends a notification message with the updated status
   * and relevant details, such as the user and order information. Finally, it sends a response indicating the status update was successful.
   *
   * @param req - The incoming request containing the user, request body with the new status, and request parameters with the order ID.
   * @param res - The response to be sent back to the client, indicating the outcome of the status update.
   * @param next - The callback to execute the next middleware or error handler in the Express.js request-response cycle.
   */
  async updateCheckoutStatus(req: Request, res: Response, next: NextFunction) {
    const data = UpdateCheckoutStatusRequest.parse(req.body);

    console.log(JSON.stringify(data, null, 2));

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

  /**
   * Retrieves all checkout orders for a user.
   *
   * This function fetches the checkout orders associated with the authenticated user from the cart service.
   * It then sends a response with the list of checkout orders and their details.
   *
   * @param req - The incoming request which must contain the user.
   * @param res - The response to be sent back to the client, containing the checkout orders.
   * @param next - The callback to execute the next middleware or error handler in the Express.js request-response cycle.
   */
  async getCheckouts(req: Request, res: Response, next: NextFunction) {
    const result = await this.cartService.getCheckouts(req.user!);
    createResponse(res, 200, "Checkouts fetched", result);
  }

  /**
   * Retrieves all checkout orders in the database.
   *
   * This function fetches all checkout orders from the cart service.
   * It then sends a response with the list of checkout orders and their details.
   *
   * @param req - The incoming request.
   * @param res - The response to be sent back to the client, containing the checkout orders.
   * @param next - The callback to execute the next middleware or error handler in the Express.js request-response cycle.
   */
  async getAllCheckouts(req: Request, res: Response, next: NextFunction) {
    const result = await this.cartService.getAllCheckouts();
    createResponse(res, 200, "Checkouts fetched", result);
  }
}

export default new CartController();
