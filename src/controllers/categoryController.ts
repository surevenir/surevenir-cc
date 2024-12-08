import { Request, Response, NextFunction } from "express";
import createResponse from "../utils/createResponse";
import {
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "../types/request/categoryRequest";
import Controller from "../utils/controllerDecorator";
import CategoryService from "../services/categoryService";

@Controller
class CategoryController {
  private categoryService: CategoryService;

  constructor() {
    this.categoryService = new CategoryService();
  }

  async createCategory(req: Request, res: Response, next: NextFunction) {
    const data: any = CreateCategoryRequest.parse(req.body);

    const category = await this.categoryService.createCategory(data, req.file);
    createResponse(res, 201, "Category created successfully", category);
  }

  async getAllCategories(req: Request, res: Response, next: NextFunction) {
    const categories = await this.categoryService.getAllCategories();
    createResponse(res, 200, "Categories retrieved successfully", categories);
  }

  async getCategoryById(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const category = await this.categoryService.getCategoryById(parseInt(id));
    createResponse(res, 200, "Category retrieved successfully", category);
  }

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

  async deleteCategory(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    await this.categoryService.deleteCategoryById(parseInt(id));
    createResponse(res, 200, "Category deleted successfully", { id });
  }
}

export default new CategoryController();
