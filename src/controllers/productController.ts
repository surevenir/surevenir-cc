import { Request, Response, NextFunction } from "express";
import createResponse from "../utils/createResponse";
import {
  CreateProductRequest,
  UpdateProductRequest,
} from "../types/request/product";
import Controller from "../utils/controllerDecorator";
import ProductService from "../services/productService";

@Controller
class ProductController {
  productService: ProductService;

  constructor() {
    this.productService = new ProductService();
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
    try {
      const products = await this.productService.getAllProducts();
      if (products.length > 0) {
        createResponse(res, 200, "Products retrieved successfully", products);
      } else {
        createResponse(res, 404, "Products not found", []);
      }
    } catch (error) {
      next(error);
    }
  }

  async getProductById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const Product = await this.productService.getProductById(parseInt(id));
      if (Product !== null) {
        createResponse(res, 200, "Product retrieved successfully", Product);
      } else {
        createResponse(res, 404, "Product not found", []);
      }
    } catch (error) {
      next(error);
    }
  }

  async getProductByQuery(req: Request, res: Response, next: NextFunction) {
    try {
      const { sort_by = "newest", category = "all" } = req.query;
      const product = await this.productService.getProductByQuery(
        sort_by as string,
        category as string
      );

      if (product && product.length > 0) {
        createResponse(res, 200, "Product retrieved successfully", product);
      } else {
        createResponse(res, 404, "Product not found", []);
      }
    } catch (error) {
      next(error);
    }
  }

  async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      let { id } = req.params;
      const data: any = UpdateProductRequest.parse(req.body);
      const product = await this.productService.updateProduct({
        id: parseInt(id),
        ...data,
      });
      createResponse(res, 200, "Product updated successfully", product);
    } catch (error) {
      next(error);
    }
  }

  async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await this.productService.deleteProductById(parseInt(id));
      createResponse(res, 200, "Product deleted successfully", { id });
    } catch (error) {
      next(error);
    }
  }
}

export default new ProductController();
