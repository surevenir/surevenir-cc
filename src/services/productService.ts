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
