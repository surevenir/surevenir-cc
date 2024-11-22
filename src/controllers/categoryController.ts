import { Request, Response, NextFunction } from "express";
import createResponse from "../utils/createResponse";
import {
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "../types/request/category";
import Controller from "../utils/controllerDecorator";
import CategoryService from "../services/categoryService";

@Controller
class CategoryController {
  categoryService: CategoryService;

  constructor() {
    this.categoryService = new CategoryService();
  }

  async createCategory(req: Request, res: Response, next: NextFunction) {
    const data: any = CreateCategoryRequest.parse(req.body);

    const category = await this.categoryService.createCategory(data);
    createResponse(res, 201, "Category created successfully", category);
  }

  async getAllCategories(req: Request, res: Response, next: NextFunction) {
    const categories = await this.categoryService.getAllCategories();
    if (categories.length > 0) {
      createResponse(res, 200, "Categories retrieved successfully", categories);
    } else {
      createResponse(res, 404, "Categories not found", []);
    }
  }

  async getCategoryById(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const category = await this.categoryService.getCategoryById(parseInt(id));
    if (category !== null) {
      createResponse(res, 200, "Category retrieved successfully", category);
    } else {
      createResponse(res, 404, "Category not found", []);
    }
  }

  async updateCategory(req: Request, res: Response, next: NextFunction) {
    let { id } = req.params;
    const data: any = UpdateCategoryRequest.parse(req.body);
    const category = await this.categoryService.updateCategory({
      id: parseInt(id),
      ...data,
    });
    createResponse(res, 200, "Category updated successfully", category);
  }

  async deleteCategory(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    await this.categoryService.deleteCategoryById(parseInt(id));
    createResponse(res, 200, "Category deleted successfully", { id });
  }
}

export default new CategoryController();
