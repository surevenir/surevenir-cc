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

  async getAllCategorys(req: Request, res: Response, next: NextFunction) {
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
    const idNew = parseInt(id);
    const data: any = UpdateCategoryRequest.parse(req.body);

    const category = await this.categoryService.updateCategory({
      id: idNew,
      ...data,
    });
    createResponse(res, 200, "Category updated successfully", category);
  }

  async deleteCategory(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const idNew = parseInt(id);
    await this.categoryService.deleteCategoryById(idNew);
    createResponse(res, 200, "Category deleted successfully", { id });
  }
}

export default new CategoryController();
