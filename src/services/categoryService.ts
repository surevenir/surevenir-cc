import prisma from "../config/database";
import ResponseError from "../utils/responseError";
import { Category } from "@prisma/client";

class CategoryService {
  async createCategory(category: Category) {
    return await prisma.category.create({
      data: category,
    });
  }

  async getAllCategories() {
    return await prisma.category.findMany();
  }

  async getCategoryById(id: number) {
    const category = await prisma.category.findUnique({
      where: {
        id,
      },
    });

    if (!category) {
      throw new ResponseError(404, "Category not found");
    }

    return category;
  }

  async updateCategory(category: Category) {
    const existingCategory = await prisma.category.findFirst({
      where: {
        id: category.id,
      },
    });

    if (!existingCategory) {
      throw new ResponseError(404, "Category not found");
    }

    return await prisma.category.update({
      where: {
        id: category.id,
      },
      data: category,
    });
  }

  async deleteCategoryById(id: number) {
    const existingCategory = await prisma.category.findFirst({
      where: {
        id,
      },
    });

    if (!existingCategory) {
      throw new ResponseError(404, "Category not found");
    }

    return await prisma.category.delete({
      where: {
        id,
      },
    });
  }
}

export default CategoryService;
