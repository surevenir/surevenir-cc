import prisma from "../config/database";
import ResponseError from "../utils/responseError";
import { Category } from "@prisma/client";
import MediaService from "./mediaService";

class CategoryService {
  private mediaService: MediaService;

  constructor() {
    this.mediaService = new MediaService();
  }

  async createCategory(category: Category, file: Express.Request["file"]) {
    if (file) {
      const mediaUrl = await this.mediaService.uploadMedia(file);
      category.image_url = mediaUrl;
    }

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

  async updateCategory(
    category: Category,
    file: Express.Multer.File | undefined
  ) {
    const existingCategory = await prisma.category.findFirst({
      where: {
        id: category.id,
      },
    });

    if (!existingCategory) {
      throw new ResponseError(404, "Category not found");
    }

    if (file) {
      const newUrl = await this.mediaService.updateMedia(
        file,
        category.image_url!
      );
      console.log(newUrl);

      category.image_url = newUrl;
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

    try {
      if (existingCategory.image_url) {
        await this.mediaService.deleteMediaFromGCSByUrl(
          existingCategory.image_url
        );
      }

      console.log("Media for category deleted successfully.");
    } catch (error) {
      console.error("Error deleting media for category:", error);
      throw new ResponseError(500, "Failed to delete media for category");
    }

    try {
      const deletedcategory = await prisma.category.delete({
        where: {
          id,
        },
      });
      console.log("category deleted successfully:", deletedcategory);
      return deletedcategory;
    } catch (error) {
      console.error("Error deleting category:", error);
      throw new ResponseError(500, "Failed to delete category");
    }
  }
}

export default CategoryService;
