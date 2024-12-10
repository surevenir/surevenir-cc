import prisma from "../config/database";
import ResponseError from "../utils/responseError";
import { Category } from "@prisma/client";
import MediaService from "./mediaService";

class CategoryService {
  private mediaService: MediaService;

  /**
   * Initializes a new instance of the CategoryService class.
   * Sets up the mediaService for handling media-related operations.
   */
  constructor() {
    this.mediaService = new MediaService();
  }

  /**
   * Creates a new category.
   * @param category The category to create.
   * @param file The image to upload as a category image.
   * @returns The created category.
   */
  async createCategory(category: Category, file: Express.Request["file"]) {
    if (file) {
      const mediaUrl = await this.mediaService.uploadMedia(file);
      category.image_url = mediaUrl;
    }

    return await prisma.category.create({
      data: category,
    });
  }

  /**
   * Retrieves all categories.
   * @returns An array of categories.
   */
  async getAllCategories() {
    return await prisma.category.findMany();
  }

  /**
   * Retrieves a category by its ID.
   * @param id The ID of the category to retrieve.
   * @returns The category with the specified ID.
   * @throws ResponseError if the category is not found.
   */
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

  /**
   * Updates an existing category by its ID.
   * @param category The category object containing updated information.
   * @param file An optional file to update the category's image.
   * @returns The updated category.
   * @throws ResponseError if the category is not found.
   */
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

  /**
   * Deletes a category by its ID.
   * @param id The ID of the category to delete.
   * @returns The deleted category.
   * @throws ResponseError if the category is not found.
   */
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
