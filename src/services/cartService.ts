import prisma from "../config/database";
import ResponseError from "../utils/responseError";
import { User } from "@prisma/client";

class CartService {
  async addproductToCart(user: User, productId: number, quantity: number) {
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: productId,
      },
    });

    if (!existingProduct) {
      throw new ResponseError(404, "Product not found");
    }

    // check if product already in cart
    // if yes, update the quantity
    // if no, add product to cart

    const existingCart = await prisma.cart.findFirst({
      where: {
        user_id: user.id,
        product_id: productId,
      },
    });

    if (existingCart) {
      await prisma.cart.update({
        where: {
          id: existingCart.id,
        },
        data: {
          quantity: existingCart.quantity + quantity,
        },
      });
    } else {
      await prisma.cart.create({
        data: {
          quantity: quantity,
          user_id: user.id,
          product_id: productId,
        },
      });
    }

    const cartWithProducts = await prisma.cart.findMany({
      where: {
        user_id: user.id,
      },
      include: {
        product: true,
      },
    });

    // calculate product total price and total price
    const totalPrice = cartWithProducts.reduce((acc, cart) => {
      return acc + cart.product.price * cart.quantity;
    }, 0);

    return {
      cart: cartWithProducts,
      total_price: totalPrice,
    };
  }

  async updateProductInCart(user: User, cartId: number, quantity: number) {
    const existingCart = await prisma.cart.findFirst({
      where: {
        id: cartId,
        user_id: user.id,
      },
    });

    if (!existingCart) {
      throw new ResponseError(404, "Cart not found");
    }

    await prisma.cart.update({
      where: {
        id: cartId,
      },
      data: {
        quantity: quantity,
      },
    });

    const cartWithProducts = await prisma.cart.findMany({
      where: {
        user_id: user.id,
      },
      include: {
        product: true,
      },
    });

    // calculate product total price and total price
    const totalPrice = cartWithProducts.reduce((acc, cart) => {
      return acc + cart.product.price * cart.quantity;
    }, 0);

    return {
      cart: cartWithProducts,
      total_price: totalPrice,
    };
  }

  async getProductsInCart(user: User) {
    const cartWithProducts = await prisma.cart.findMany({
      where: {
        user_id: user.id,
      },
      include: {
        product: true,
      },
    });

    // calculate product total price and total price
    const totalPrice = cartWithProducts.reduce((acc, cart) => {
      return acc + cart.product.price * cart.quantity;
    }, 0);

    return {
      cart: cartWithProducts,
      total_price: totalPrice,
    };
  }

  async deleteCartItem(user: User, cartId: number) {
    const existingCart = await prisma.cart.findFirst({
      where: {
        id: cartId,
        user_id: user.id,
      },
    });

    if (!existingCart) {
      throw new ResponseError(404, "Target not found");
    }

    await prisma.cart.delete({
      where: {
        id: cartId,
      },
    });

    const cartWithProducts = await prisma.cart.findMany({
      where: {
        user_id: user.id,
      },
      include: {
        product: true,
      },
    });

    // calculate product total price and total price
    const totalPrice = cartWithProducts.reduce((acc, cart) => {
      return acc + cart.product.price * cart.quantity;
    }, 0);

    return {
      cart: cartWithProducts,
      total_price: totalPrice,
    };
  }

  async deleteAllProductsInCart(user: User) {
    await prisma.cart.deleteMany({
      where: {
        user_id: user.id,
      },
    });

    return {
      cart: [],
      total_price: 0,
    };
  }
}

export default CartService;
