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
  productService: ProductService;
  merchantService: MerchantService;

  constructor() {
    this.productService = new ProductService();
    this.merchantService = new MerchantService();
  }

  async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const data: any = CreateProductRequest.parse(req.body);
      const product = await this.productService.createProduct(data);
      createResponse(res, 201, "Product created successfully", product);
    } catch (error) {
      next(error);
    }
  }

  async getAllProducts(req: Request, res: Response, next: NextFunction) {
    const products = await this.productService.getAllProducts();
    createResponse(res, 200, "Products retrieved successfully", products);
  }

  async getProductById(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const product = await this.productService.getProductById(parseInt(id));
    createResponse(res, 200, "Product retrieved successfully", product);
  }

  async getProductByQuery(req: Request, res: Response, next: NextFunction) {
    const { sort_by = "newest", category = "all" } = req.query;

    const product = await this.productService.getProductByQuery(
      sort_by as string,
      category as string
    );

    createResponse(res, 200, "Product retrieved successfully", product);
  }

  async getProductWithReviews(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const product = await this.productService.getProductWithReviews(
      parseInt(id)
    );
    createResponse(res, 200, "Product retrieved successfully", product);
  }

  async updateProduct(req: Request, res: Response, next: NextFunction) {
    let { id } = req.params;
    const data: any = UpdateProductRequest.parse(req.body);

    const product = await this.productService.updateProduct({
      id: parseInt(id),
      ...data,
    });

    createResponse(res, 200, "Product updated successfully", product);
  }

  async deleteProduct(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    await this.productService.deleteProductById(parseInt(id));
    createResponse(res, 200, "Product deleted successfully", { id });
  }
}

export default new ProductController();
