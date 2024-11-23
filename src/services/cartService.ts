import prisma from "../config/database";
import ResponseError from "../utils/responseError";
import { Cart } from "@prisma/client";

class CartService {
  async createCart(cart: Cart) {
    const existingUser = await prisma.user.findFirst({
      where: {
        id: cart.user_id,
      },
    });

    const existingProduct = await prisma.product.findFirst({
      where: {
        id: cart.product_id,
      },
    });

    if (!existingUser && !existingProduct) {
      throw new ResponseError(404, "User and product not found");
    }

    if (!existingUser) {
      throw new ResponseError(404, "User not found");
    }

    if (!existingProduct) {
      throw new ResponseError(404, "Product not found");
    }

    return await prisma.cart.create({
      data: cart,
    });
  }

  async getAllCarts() {
    return await prisma.cart.findMany();
  }

  async getCartById(id: number) {
    const cart = await prisma.cart.findUnique({
      where: {
        id,
      },
    });

    if (!cart) {
      throw new ResponseError(404, "Cart not found");
    }

    return cart;
  }

  async updateCart(cart: Cart) {
    const existingCart = await prisma.cart.findFirst({
      where: {
        id: cart.id,
      },
    });

    if (!existingCart) {
      throw new ResponseError(404, "Cart not found");
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        id: cart.user_id,
      },
    });

    const existingProduct = await prisma.product.findFirst({
      where: {
        id: cart.product_id,
      },
    });

    if (!existingUser) {
      throw new ResponseError(404, "User not found");
    }

    if (!existingProduct) {
      throw new ResponseError(404, "Product not found");
    }

    return await prisma.cart.update({
      where: {
        id: cart.id,
      },
      data: cart,
    });
  }

  async deleteCartById(id: number) {
    const existingCart = await prisma.cart.findFirst({
      where: {
        id,
      },
    });

    if (!existingCart) {
      throw new ResponseError(404, "Cart not found");
    }

    return await prisma.cart.delete({
      where: {
        id,
      },
    });
  }
}

export default CartService;
