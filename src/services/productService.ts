import prisma from "../config/database";
import ResponseError from "../utils/responseError";
import { Product } from "@prisma/client";

class ProductService {
  async createProduct(product: Product) {
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
    const product = prisma.product.findUnique({
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
    const product = await prisma.product.findMany({
      where: {
        product_categories: {
          some: {
            category: {
              name: category ? category : undefined,
            },
          },
        },
      },
      orderBy: sort_by ? { [sort_by]: "asc" } : undefined,
      include: {
        product_categories: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!product || product.length === 0) {
      throw new ResponseError(404, "Product not found");
    }

    return product;
  }

  async updateProduct(product: Product) {
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: product.id,
      },
    });

    if (!existingProduct) {
      throw new ResponseError(404, "Product not found");
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
