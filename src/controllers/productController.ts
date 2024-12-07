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
  private productService: ProductService;

  constructor() {
    this.productService = new ProductService();
  }

  async createProduct(req: Request, res: Response, next: NextFunction) {
    const data: any = CreateProductRequest.parse(req.body);
    const categoryIds = data.category_ids
      .split(",")
      .map((id: string) => parseInt(id));
    delete data.category_ids;

    const product = await this.productService.createProduct(
      {
        ...data,
        merchant_id: parseInt(data.merchant_id),
        price: parseFloat(data.price),
        stock: parseInt(data.stock),
      },
      categoryIds,
      req.files
    );
    createResponse(res, 201, "Product created successfully", product);
  }

  async addProductImages(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const product = await this.productService.addProductImages(
      parseInt(id),
      req.files
    );
    createResponse(res, 200, "Product images added successfully", product);
  }

  async getProductById(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const product = await this.productService.getProductById(
      parseInt(id),
      req.user!.id
    );
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

  async getProductBySlug(req: Request, res: Response, next: NextFunction) {
    const { slug } = req.params;
    const { user_id } = req.query;
    const product = await this.productService.getProductBySlug(
      slug,
      user_id as string
    );
    createResponse(res, 200, "product retrieved successfully", product);
  }

  async getProductReviews(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const product = await this.productService.getProductReviews(parseInt(id));
    createResponse(res, 200, "Product reviews retrieved successfully", product);
  }

  async updateProduct(req: Request, res: Response, next: NextFunction) {
    let { id } = req.params;
    const data: any = UpdateProductRequest.parse(req.body);
    const categoryIds = data.category_ids;
    delete data.category_ids;

    const product = await this.productService.updateProduct(
      {
        id: parseInt(id),
        ...data,
      },
      categoryIds,
      req.files
    );

    createResponse(res, 200, "Product updated successfully", product);
  }

  async deleteProduct(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    await this.productService.deleteProductById(parseInt(id));
    createResponse(res, 200, "Product deleted successfully", { id });
  }

  async getTopFavoritedProducts(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { limit = 10 } = req.query;
    const products = await this.productService.getTopFavoritedProducts(
      parseInt(limit as string)
    );
    createResponse(res, 200, "Top favorited products retrieved successfully", {
      products,
    });
  }

  async addProductToFavorite(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const product = await this.productService.addProductToFavorite(
      parseInt(id),
      req.user!.id!
    );
    createResponse(res, 200, "Product images added successfully", product);
  }

  async deleteProductFromFavorite(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { id } = req.params;
    await this.productService.deleteProductFromFavorite(
      parseInt(id),
      req.user!.id!
    );
    createResponse(res, 200, "Product deleted from favorite successfully", {
      id,
    });
  }
}

export default new ProductController();
