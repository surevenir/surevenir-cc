import prisma from "../config/database";
import { CheckoutStatus } from "../types/enum/dbEnum";
import ResponseError from "../utils/responseError";
import { User } from "@prisma/client";
import { MediaType } from "./mediaService";

class CartService {
  /**
   * Adds a product to the user's cart. If the product is already in the cart, its quantity is increased.
   * @param user The user to add the product to their cart.
   * @param productId The ID of the product to add.
   * @param quantity The quantity of the product to add.
   * @returns A cart containing the products in the user's cart and the total price of the products.
   * @throws {ResponseError} If the product is not found.
   */
  async addproductToCart(user: User, productId: number, quantity: number) {
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: productId,
      },
    });

    if (!existingProduct) {
      throw new ResponseError(404, "Product not found");
    }

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

    const totalPrice = cartWithProducts.reduce((acc, cart) => {
      return acc + cart.product.price * cart.quantity;
    }, 0);

    return {
      cart: cartWithProducts,
      total_price: totalPrice,
    };
  }

  /**
   * Updates the quantity of a product in the user's cart. If the quantity is zero, the product is removed from the cart.
   * @param user The user to update the cart for.
   * @param cartId The ID of the cart item to update.
   * @param quantity The new quantity of the product in the cart.
   * @returns A cart containing the products in the user's cart and the total price of the products.
   */
  async updateProductInCart(user: User, cartId: number, quantity: number) {
    if (quantity === 0) {
      await prisma.cart.delete({
        where: {
          id: cartId,
        },
      });
    } else {
      await prisma.cart.update({
        where: {
          id: cartId,
        },
        data: {
          quantity: quantity,
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

    const totalPrice = cartWithProducts.reduce((acc, cart) => {
      return acc + cart.product.price * cart.quantity;
    }, 0);

    return {
      cart: cartWithProducts,
      total_price: totalPrice,
    };
  }

  /**
   * Retrieves the products in a user's cart. The products include the product object with its merchant and images.
   * @param user The user to retrieve the cart for.
   * @returns An object containing the cart and the total price of the products in the cart.
   */
  async getProductsInCart(user: User) {
    const cartWithProducts: any = await prisma.cart.findMany({
      where: {
        user_id: user.id,
      },
      include: {
        product: {
          include: {
            merchant: true,
          },
        },
      },
    });

    for (const cart of cartWithProducts) {
      const images = await prisma.images.findMany({
        where: {
          item_id: cart.product_id,
          type: MediaType.PRODUCT,
        },
      });

      cart.product.images = images.map((image) => image.url);
      cart.subtotal_price = cart.product.price * cart.quantity;
    }

    const totalPrice = cartWithProducts.reduce((acc: any, cart: any) => {
      return acc + cart.product.price * cart.quantity;
    }, 0);

    return {
      cart: cartWithProducts,
      total_price: totalPrice,
    };
  }

  /**
   * Deletes a product from the user's cart.
   * @param user The user to delete the product from their cart.
   * @param cartId The ID of the product to delete from the user's cart.
   * @returns An object containing the cart and the total price of the products in the cart.
   * @throws {ResponseError} If the product is not found in the user's cart.
   */
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

    const totalPrice = cartWithProducts.reduce((acc, cart) => {
      return acc + cart.product.price * cart.quantity;
    }, 0);

    return {
      cart: cartWithProducts,
      total_price: totalPrice,
    };
  }

  /**
   * Deletes all products from a user's cart.
   * @param user The user to delete all products from their cart.
   * @returns An object containing an empty cart and the total price of the products in the cart.
   */
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

  /**
   * Performs a checkout for a user. This will create a checkout entity in the database.
   * @param user The user to checkout.
   * @param productIds The product ids to checkout.
   * @returns An object containing the cart, checkout and checkout details.
   * @throws {ResponseError} If the product is not found in the user's cart.
   */
  async checkout(user: User, productIds: number[]) {
    const cartWithProducts = await prisma.cart.findMany({
      where: {
        AND: [{ user_id: user.id }, { product_id: { in: productIds } }],
      },
      include: {
        product: {
          include: {
            merchant: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
    console.log("cartWithProducts:", cartWithProducts);
    for (const cart of cartWithProducts as any) {
      cart.subtotal_price = cart.product.price * cart.quantity;
    }

    const cartProductIds = cartWithProducts.map((cart) => cart.product_id);
    const notFoundProductIds = productIds.filter(
      (id) => !cartProductIds.includes(id)
    );
    if (notFoundProductIds.length > 0) {
      throw new ResponseError(
        404,
        "Product in cart not found. id: " + notFoundProductIds.join(", ")
      );
    }

    const totalPrice = cartWithProducts.reduce((acc, cart) => {
      return acc + cart.product.price * cart.quantity;
    }, 0);
    console.log("totalPrice:", totalPrice);

    let checkout: any;
    let checkoutDetails: any[] = [];

    await prisma.$transaction(async (prisma) => {
      checkout = await prisma.checkout.create({
        data: {
          user_id: user.id,
          total_price: totalPrice,
          status: CheckoutStatus.PENDING,
        },
      });
      console.log("checkout:", checkout);

      checkoutDetails = cartWithProducts.map((cart) => ({
        product_id: cart.product_id,
        checkout_id: checkout.id,
        product_quantity: cart.quantity,
        product_subtotal: cart.product.price * cart.quantity,
        product_identity: cart.product.name + "-" + cart.product.merchant.name,
        product_price: cart.product.price,
      }));
      console.log("checkoutDetails:", checkoutDetails);

      await prisma.checkoutDetails.createMany({
        data: checkoutDetails,
      });

      for (const cart of cartWithProducts) {
        await prisma.product.update({
          where: {
            id: cart.product_id,
          },
          data: {
            stock: {
              decrement: cart.quantity,
            },
          },
        });
      }

      await prisma.cart.deleteMany({
        where: {
          AND: [{ user_id: user.id }, { product_id: { in: productIds } }],
        },
      });
    });

    return {
      cart: cartWithProducts,
      checkout: checkout,
      checkout_details: checkoutDetails,
    };
  }

  /**
   * Updates the status of a checkout order.
   *
   * This function parses the request body to retrieve the new status for a checkout order and the order ID from the request parameters.
   * It updates the checkout status in the database using the cart service, then sends a response indicating the status update was successful.
   *
   * @param checkoutId - The ID of the checkout order to update.
   * @param status - The new status for the checkout order. Must be one of PENDING, DELIVERED, CANCELLED, or COMPLETED.
   *
   * @returns An object containing the checkout order and the new status.
   */
  async updateCheckoutStatus(checkoutId: number, status: string) {
    const existingCheckout = await prisma.checkout.findFirst({
      where: {
        id: checkoutId,
      },
    });

    if (!existingCheckout) {
      throw new ResponseError(404, "Checkout not found");
    }

    await prisma.checkout.update({
      where: {
        id: checkoutId,
      },
      data: {
        status: status,
      },
    });

    return {
      checkout: existingCheckout,
      status: status,
    };
  }

  /**
   * Retrieves all checkout orders for a user.
   *
   * This function fetches the checkout orders associated with the authenticated user from the cart service.
   * It then sends a response with the list of checkout orders and their details.
   *
   * @param user - The user to retrieve the checkouts for.
   *
   * @returns An array of checkout orders associated with the user, with their details.
   */
  async getCheckouts(user: User) {
    const checkouts = await prisma.checkout.findMany({
      where: {
        user_id: user.id,
      },
      include: {
        checkout_details: {
          include: {
            product: {
              include: {
                merchant: true,
              },
            },
          },
        },
      },
    });

    for (const checkout of checkouts) {
      for (const detail of checkout.checkout_details) {
        if (detail.product) {
          const images = await prisma.images.findMany({
            where: {
              item_id: detail.product.id,
              type: "product",
            },
          });

          (detail.product as any).images = images;
        }
      }
    }

    return checkouts;
  }

  async getAllCheckouts() {
    const checkouts = await prisma.checkout.findMany({
      include: {
        checkout_details: {
          include: {
            product: {
              include: {
                merchant: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    for (const checkout of checkouts) {
      for (const detail of checkout.checkout_details) {
        if (detail.product) {
          const images = await prisma.images.findMany({
            where: {
              item_id: detail.product.id,
              type: "product",
            },
          });

          (detail.product as any).images = images;
        }
      }
    }

    return checkouts;
  }
}

export default CartService;
