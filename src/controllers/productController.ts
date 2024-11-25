import { Request, Response, NextFunction } from "express";
import createResponse from "../utils/createResponse";
import {
  CreateProductRequest,
  UpdateProductRequest,
} from "../types/request/product";
import Controller from "../utils/controllerDecorator";
import ProductService from "../services/productService";
import MerchantService from "../services/merchantService";

@Controller
class ProductController {
  private productService: ProductService;
  private merchantService: MerchantService;

  constructor() {
    this.productService = new ProductService();
    this.merchantService = new MerchantService();
  }

  async createProduct(req: Request, res: Response, next: NextFunction) {
    const data: any = CreateProductRequest.parse(req.body);
    const product = await this.productService.createProduct(data, req.files);
    createResponse(res, 201, "Product created successfully", product);
  }

  async getProductById(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const product = await this.productService.getProductById(parseInt(id));
    createResponse(res, 200, "Product retrieved successfully", product);
  }

  async getAllProducts(req: Request, res: Response, next: NextFunction) {
    const { sort_by = "newest", category = "all" } = req.query;

    const product = await this.productService.getAllProducts(
      sort_by as string,
      category as string
    );

    createResponse(res, 200, "Product retrieved successfully", product);
  }

  async getProductReviews(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const product = await this.productService.getProductReviews(
      parseInt(id)
    );
    createResponse(res, 200, "Product retrieved successfully", product);
  }

  async updateProduct(req: Request, res: Response, next: NextFunction) {
    let { id } = req.params;
    const data: any = UpdateProductRequest.parse(req.body);

    const product = await this.productService.updateProduct(
      {
        id: parseInt(id),
        ...data,
      },
      req.files
    );

    createResponse(res, 200, "Product updated successfully", product);
  }

  async deleteProduct(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    await this.productService.deleteProductById(parseInt(id));
    createResponse(res, 200, "Product deleted successfully", { id });
  }
}

export default new ProductController();
