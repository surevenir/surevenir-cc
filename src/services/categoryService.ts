import prisma from "../config/database";
import ResponseError from "../utils/responseError";
import { Category } from "@prisma/client";

class CategoryService {
  async createCategory(category: Category) {
    return prisma.category.create({
      data: {
        ...category,
      },
    });
  }

  async getAllCategories() {
    return prisma.category.findMany();
  }

  async getCategoryById(id: number) {
    const category = prisma.category.findUnique({
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

    return prisma.category.update({
      where: {
        id: category.id,
      },
      data: {
        ...category,
        updatedAt: new Date(),
      },
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

    return prisma.category.delete({
      where: {
        id,
      },
    });
  }
}

export default CategoryService;
