import prisma from "../config/database";
import ResponseError from "../utils/responseError";
import { Cart } from "@prisma/client";

class CartService {
  async createCart(cart: Cart) {
    return prisma.cart.create({
      data: {
        ...cart,
      },
    });
  }

  async getAllCarts() {
    return prisma.cart.findMany();
  }

  async getCartById(id: number) {
    const cart = prisma.cart.findUnique({
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

    return prisma.cart.update({
      where: {
        id: cart.id,
      },
      data: {
        ...cart,
        updatedAt: new Date(),
      },
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

    return prisma.cart.delete({
      where: {
        id,
      },
    });
  }
}

export default CartService;
