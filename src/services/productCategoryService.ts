import prisma from "../config/database";
import ResponseError from "../utils/responseError";
import { ProductCategory } from "@prisma/client";

class ProductCategoryService {
  async createProductCategory(productCategory: ProductCategory) {
    return prisma.productCategory.create({
      data: {
        ...productCategory,
      },
    });
  }

  async getAllProductCategories() {
    return prisma.productCategory.findMany();
  }

  async getProductCategoryById(id: number) {
    const productCategory = prisma.productCategory.findUnique({
      where: {
        id,
      },
    });

    if (!productCategory) {
      throw new ResponseError(404, "Product Category not found");
    }

    return productCategory;
  }

  async updateProductCategory(productCategory: ProductCategory) {
    const existingProductCategory = await prisma.productCategory.findFirst({
      where: {
        id: productCategory.id,
      },
    });

    if (!existingProductCategory) {
      throw new ResponseError(404, "Product Category not found");
    }

    return prisma.productCategory.update({
      where: {
        id: productCategory.id,
      },
      data: {
        ...productCategory,
        updatedAt: new Date(),
      },
    });
  }

  async deleteProductCategoryById(id: number) {
    const existingProductCategory = await prisma.productCategory.findFirst({
      where: {
        id,
      },
    });

    if (!existingProductCategory) {
      throw new ResponseError(404, "Product Category not found");
    }

    return prisma.productCategory.delete({
      where: {
        id,
      },
    });
  }
}

export default ProductCategoryService;
