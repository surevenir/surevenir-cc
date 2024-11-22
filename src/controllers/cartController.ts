import { Request, Response, NextFunction } from "express";
import createResponse from "../utils/createResponse";
import { CreateCartRequest, UpdateCartRequest } from "../types/request/cart";
import Controller from "../utils/controllerDecorator";
import CartService from "../services/cartService";

@Controller
class CartController {
  cartService: CartService;

  constructor() {
    this.cartService = new CartService();
  }

  async createCart(req: Request, res: Response, next: NextFunction) {
    const data: any = CreateCartRequest.parse(req.body);
    const cart = await this.cartService.createCart(data);
    createResponse(res, 201, "Cart created successfully", cart);
  }

  async getAllCarts(req: Request, res: Response, next: NextFunction) {
    const carts = await this.cartService.getAllCarts();
    if (carts.length > 0) {
      createResponse(res, 200, "Carts retrieved successfully", carts);
    } else {
      createResponse(res, 404, "Carts not found", []);
    }
  }

  async getCartById(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const cart = await this.cartService.getCartById(parseInt(id));
    if (cart !== null) {
      createResponse(res, 200, "Cart retrieved successfully", cart);
    } else {
      createResponse(res, 404, "Cart not found", []);
    }
  }

  async updateCart(req: Request, res: Response, next: NextFunction) {
    let { id } = req.params;
    const data: any = UpdateCartRequest.parse(req.body);
    const cart = await this.cartService.updateCart({
      id: parseInt(id),
      ...data,
    });
    createResponse(res, 200, "Cart updated successfully", cart);
  }

  async deleteCart(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    await this.cartService.deleteCartById(parseInt(id));
    createResponse(res, 200, "Cart deleted successfully", { id });
  }
}

export default new CartController();
