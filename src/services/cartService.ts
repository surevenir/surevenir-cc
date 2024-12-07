import prisma from "../config/database";
import { CheckoutStatus } from "../types/enum/dbEnum";
import ResponseError from "../utils/responseError";
import { User } from "@prisma/client";
import { MediaType } from "./mediaService";

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
    // if quantity is 0, delete cart
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

    // get images for each product
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

    // calculate product total price and total price
    const totalPrice = cartWithProducts.reduce((acc: any, cart: any) => {
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

  async checkout(user: User, productIds: number[]) {
    // check if all products in cart
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

    // check all product ids are matched
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
      // Create checkout
      checkout = await prisma.checkout.create({
        data: {
          user_id: user.id,
          total_price: totalPrice,
          status: CheckoutStatus.PENDING,
        },
      });
      console.log("checkout:", checkout);

      // Prepare checkout details
      checkoutDetails = cartWithProducts.map((cart) => ({
        product_id: cart.product_id,
        checkout_id: checkout.id,
        product_quantity: cart.quantity,
        product_subtotal: cart.product.price * cart.quantity,
        product_identity: cart.product.name + "-" + cart.product.merchant.name,
        product_price: cart.product.price,
      }));
      console.log("checkoutDetails:", checkoutDetails);

      // Insert checkout details
      await prisma.checkoutDetails.createMany({
        data: checkoutDetails,
      });

      // Update stock for each product
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

      // Delete items from cart
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

  // async getCheckouts(user: User) {
  //   const checkouts = await prisma.checkout.findMany({
  //     where: {
  //       user_id: user.id,
  //     },
  //     include: {
  //       checkout_details: {
  //         include: {
  //           product: {
  //             include: {
  //               merchant: true,
  //             },
  //           },
  //         },
  //       },
  //     },
  //   });

  //   return checkouts;
  // }

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

    // Tambahkan images ke dalam setiap product di checkout_details
    for (const checkout of checkouts) {
      for (const detail of checkout.checkout_details) {
        if (detail.product) {
          const images = await prisma.images.findMany({
            where: {
              item_id: detail.product.id,
              type: "product", // Filter untuk gambar produk
            },
          });

          // Tambahkan properti images ke dalam product secara dinamis
          (detail.product as any).images = images;
        }
      }
    }

    return checkouts;
  }
}

export default CartService;
