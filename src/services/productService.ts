import prisma from "../config/database";
import ResponseError from "../utils/responseError";
import { Product } from "@prisma/client";

class ProductService {
  async createProduct(product: Product) {
    const existingMerchant = await prisma.merchant.findFirst({
      where: {
        id: product.merchant_id,
      },
    });

    if (!existingMerchant) {
      throw new ResponseError(404, "Merchant not found");
    }

    return prisma.product.create({
      data: {
        ...product,
      },
    });
  }

  async getAllProducts() {
    return prisma.product.findMany();
  }

  async getProductById(id: number) {
    const product = await prisma.product.findUnique({
      where: {
        id,
      },
    });

    if (!product) {
      throw new ResponseError(404, "Product not found");
    }

    return product;
  }

  async getProductByQuery(sort_by: string, category: string) {
    const sortOptions: Record<
      string,
      { column: string; direction: "asc" | "desc" }
    > = {
      newest: { column: "createdAt", direction: "desc" },
      oldest: { column: "createdAt", direction: "asc" },
      price_asc: { column: "price", direction: "asc" },
      price_desc: { column: "price", direction: "desc" },
      popular: { column: "popularity", direction: "desc" },
    };

    const sortOption = sortOptions[sort_by] || sortOptions.newest;

    const product = await prisma.product.findMany({
      where:
        category !== "all"
          ? {
              product_categories: {
                some: {
                  category: {
                    name: category,
                  },
                },
              },
            }
          : undefined,
      orderBy: { [sortOption.column]: sortOption.direction },
      include: {
        product_categories: {
          select: {
            category: {
              select: {
                name: true, // Hanya menampilkan atribut `name` dari `category`
              },
            },
          },
        },
      },
    });

    if (!product || product.length === 0) {
      throw new ResponseError(404, "Product not found");
    }

    return product;
  }

  async getProductWithReviews(id: number) {
    const productWithReviews = await prisma.product.findUnique({
      where: { id: id },
      include: {
        reviews: {
          include: {
            user: true, // Mengambil detail user jika diperlukan
          },
        },
      },
    });

    if (!productWithReviews) {
      throw new ResponseError(404, "Product not found");
    }

    return productWithReviews;
  }

  async updateProduct(product: Product) {
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: product.id,
      },
    });

    const existingMerchant = await prisma.merchant.findFirst({
      where: {
        id: product.merchant_id,
      },
    });

    if (!existingProduct) {
      throw new ResponseError(404, "Product not found");
    }

    if (!existingMerchant) {
      throw new ResponseError(404, "Merchant not found");
    }

    return prisma.product.update({
      where: {
        id: product.id,
      },
      data: {
        ...product,
        updatedAt: new Date(),
      },
    });
  }

  async deleteProductById(id: number) {
    const existingProduct = await prisma.product.findFirst({
      where: {
        id,
      },
    });

    if (!existingProduct) {
      throw new ResponseError(404, "Product not found");
    }

    return prisma.product.delete({
      where: {
        id,
      },
    });
  }
}

export default ProductService;
