import { Request, Response, NextFunction } from "express";
import createResponse from "../utils/createResponse";
import {
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "../types/request/categoryRequest";
import Controller from "../utils/controllerDecorator";
import CategoryService from "../services/categoryService";
import setCache from "../utils/setCache";

@Controller
class CategoryController {
  private categoryService: CategoryService;

  /**
   * Initializes a new instance of the CategoryController class.
   * Sets up the categoryService for handling category-related operations.
   */
  constructor() {
    this.categoryService = new CategoryService();
  }

  /**
   * Creates a new category.
   * @param req Request object containing the request body and a single file.
   * @param res Response object to send the response.
   * @param next NextFunction object to call the next middleware.
   * @returns A Promise that resolves to the created category.
   */
  async createCategory(req: Request, res: Response, next: NextFunction) {
    const data: any = CreateCategoryRequest.parse(req.body);

    const category = await this.categoryService.createCategory(data, req.file);
    createResponse(res, 201, "Category created successfully", category);
  }

  /**
   * Retrieves all categories.
   * @param req Request object.
   * @param res Response object to send the response.
   * @param next NextFunction object to call the next middleware.
   * @returns A Promise that resolves to an array of categories.
   */
  async getAllCategories(req: Request, res: Response, next: NextFunction) {
    const categories = await this.categoryService.getAllCategories();
    setCache(req, createResponse(res, 200, "Categories retrieved successfully", categories));
  }

  /**
   * Retrieves a category by ID.
   * @param req Request object containing the category ID as a parameter.
   * @param res Response object to send the response.
   * @param next NextFunction object to call the next middleware.
   * @returns A Promise that resolves to the category with the specified ID.
   */
  async getCategoryById(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const category = await this.categoryService.getCategoryById(parseInt(id));
    setCache(req, createResponse(res, 200, "Category retrieved successfully", category));
  }

  /**
   * Updates a category by ID.
   * @param req Request object containing the category ID as a parameter and the updated data in the body.
   * @param res Response object to send the response.
   * @param next NextFunction object to call the next middleware.
   * @returns A Promise that resolves to the updated category.
   */
  async updateCategory(req: Request, res: Response, next: NextFunction) {
    let { id } = req.params;
    const data: any = UpdateCategoryRequest.parse(req.body);

    const file = req.file;

    const category = await this.categoryService.updateCategory(
      {
        id: parseInt(id),
        ...data,
      },
      file
    );
    createResponse(res, 200, "Category updated successfully", category);
  }

  /**
   * Deletes a category by ID.
   * @param req Request object containing the category ID as a parameter.
   * @param res Response object to send the response.
   * @param next NextFunction object to call the next middleware.
   * @returns A Promise that resolves to an object with the deleted category ID.
   */
  async deleteCategory(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    await this.categoryService.deleteCategoryById(parseInt(id));
    createResponse(res, 200, "Category deleted successfully", { id });
  }
}

export default new CategoryController();
