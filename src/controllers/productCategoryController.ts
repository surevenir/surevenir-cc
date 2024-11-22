import { Request, Response, NextFunction } from "express";
import createResponse from "../utils/createResponse";
import {
  CreateProductCategoryRequest,
  UpdateProductCategoryRequest,
} from "../types/request/productCategory";
import Controller from "../utils/controllerDecorator";
import ProductCategoryService from "../services/productCategoryService";

@Controller
class ProductCategoryController {
  productCategoryService: ProductCategoryService;

  constructor() {
    this.productCategoryService = new ProductCategoryService();
  }

  async createProductCategory(req: Request, res: Response, next: NextFunction) {
    const data: any = CreateProductCategoryRequest.parse(req.body);

    const category = await this.productCategoryService.createProductCategory(
      data
    );
    createResponse(res, 201, "Product category created successfully", category);
  }

  async getAllProductCategories(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const productCategories =
      await this.productCategoryService.getAllProductCategories();
    if (productCategories.length > 0) {
      createResponse(
        res,
        200,
        "Product Categories retrieved successfully",
        productCategories
      );
    } else {
      createResponse(res, 404, "ProductCategories not found", []);
    }
  }

  async getProductCategoryById(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { id } = req.params;
    const productCategory =
      await this.productCategoryService.getProductCategoryById(parseInt(id));
    if (productCategory !== null) {
      createResponse(
        res,
        200,
        "Product Category retrieved successfully",
        productCategory
      );
    } else {
      createResponse(res, 404, "Product Category not found", []);
    }
  }

  async updateProductCategory(req: Request, res: Response, next: NextFunction) {
    let { id } = req.params;
    const data: any = UpdateProductCategoryRequest.parse(req.body);
    const category = await this.productCategoryService.updateProductCategory({
      id: parseInt(id),
      ...data,
    });
    createResponse(res, 200, "Product Category updated successfully", category);
  }

  async deleteProductCategory(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    await this.productCategoryService.deleteProductCategoryById(parseInt(id));
    createResponse(res, 200, "Product Category deleted successfully", { id });
  }
}

export default new ProductCategoryController();
