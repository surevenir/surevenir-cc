import { Request, Response, NextFunction } from "express";
import createResponse from "../utils/createResponse";
import {
  CreateProductRequest,
  UpdateProductRequest,
} from "../types/request/productRequest";
import Controller from "../utils/controllerDecorator";
import ProductService from "../services/productService";
import setCache from "../utils/setCache";

@Controller
class ProductController {
  private productService: ProductService;

  /**
   * Initializes a new instance of the ProductController class.
   * Sets up the productService for handling product-related operations.
   */
  constructor() {
    this.productService = new ProductService();
  }

  /**
   * Creates a new product.
   * @param req Request object containing the request body and files.
   * @param res Response object to send the response.
   * @param next NextFunction object to call the next middleware.
   * @returns A Promise that resolves to the created product.
   */
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

  /**
   * Adds images to a specified product.
   * @param req Request object containing the product ID as a parameter and the images as files.
   * @param res Response object to send the response.
   * @param next NextFunction object to call the next middleware.
   * @returns A Promise that resolves when images are added successfully and the response is sent.
   */
  async addProductImages(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const product = await this.productService.addProductImages(
      parseInt(id),
      req.files
    );
    createResponse(res, 200, "Product images added successfully", product);
  }

  /**
   * Retrieves a product by ID.
   * @param req Request object containing the product ID as a parameter.
   * @param res Response object to send the response.
   * @param next NextFunction object to call the next middleware.
   * @returns A Promise that resolves to the product with the specified ID.
   */
  async getProductById(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const product = await this.productService.getProductById(
      parseInt(id),
      req.user!.id
    );
    setCache(req, createResponse(res, 200, "Product retrieved successfully", product));
  }

  /**
   * Retrieves all products.
   * @param req Request object containing query parameters of `sort_by` and `category`.
   * @param res Response object to send the response.
   * @param next NextFunction object to call the next middleware.
   * @returns A Promise that resolves to an array of products.
   */
  async getAllProducts(req: Request, res: Response, next: NextFunction) {
    const { sort_by = "newest", category = "all" } = req.query;

    const product = await this.productService.getAllProducts(
      sort_by as string,
      category as string
    );
    setCache(req, createResponse(res, 200, "Product retrieved successfully", product));
  }

  /**
   * Retrieves all products created by the owner of the request.
   * @param req Request object containing query parameters of `sort_by` and `category`.
   * @param res Response object to send the response.
   * @param next NextFunction object to call the next middleware.
   * @returns A Promise that resolves to an array of products created by the owner of the request.
   */
  async getAllProductsByOwner(req: Request, res: Response, next: NextFunction) {
    const { sort_by = "newest", category = "all" } = req.query;

    const product = await this.productService.getAllProductsByOwner(
      sort_by as string,
      category as string,
      req.user!
    );

    createResponse(res, 200, "Product retrieved successfully", product);
  }

  /**
   * Retrieves a product by its slug.
   * @param req Request object containing the product slug as a parameter and optionally a user_id as a query.
   * @param res Response object to send the response.
   * @param next NextFunction object to call the next middleware.
   * @returns A Promise that resolves to the product with the specified slug.
   */
  async getProductBySlug(req: Request, res: Response, next: NextFunction) {
    const { slug } = req.params;
    const { user_id } = req.query;
    const product = await this.productService.getProductBySlug(
      slug,
      user_id as string
    );
    createResponse(res, 200, "product retrieved successfully", product);
  }

  /**
   * Retrieves all reviews of a product by its ID.
   * @param req Request object containing the product ID as a parameter.
   * @param res Response object to send the response.
   * @param next NextFunction object to call the next middleware.
   * @returns A Promise that resolves to an array of reviews of the product with the specified ID.
   */
  async getProductReviews(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const product = await this.productService.getProductReviews(parseInt(id));
    setCache(req, createResponse(res, 200, "Product reviews retrieved successfully", product));
  }

  /**
   * Updates a product by its ID.
   * @param req Request object containing the product ID as a parameter, the updated data in the body, and the images as files.
   * @param res Response object to send the response.
   * @param next NextFunction object to call the next middleware.
   * @returns A Promise that resolves to the updated product.
   */
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

  /**
   * Deletes a product by its ID.
   * @param req Request object containing the product ID as a parameter.
   * @param res Response object to send the response.
   * @param next NextFunction object to call the next middleware.
   * @returns A Promise that resolves to an object with the deleted product ID.
   */
  async deleteProduct(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    await this.productService.deleteProductById(parseInt(id));
    createResponse(res, 200, "Product deleted successfully", { id });
  }

  /**
   * Retrieves the top favorited products with the specified limit.
   * @param req Request object containing the limit as a query parameter.
   * @param res Response object to send the response.
   * @param next NextFunction object to call the next middleware.
   * @returns A Promise that resolves to an object containing the top favorited products.
   */
  async getTopFavoritedProducts(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { limit = 10 } = req.query;
    const products = await this.productService.getTopFavoritedProducts(
      parseInt(limit as string)
    );
    setCache(req, createResponse(res, 200, "Top favorited products retrieved successfully", { products }));
  }

  /**
   * Retrieves the products favorited by the user.
   * @param req Request object containing the user object.
   * @param res Response object to send the response.
   * @param next NextFunction object to call the next middleware.
   * @returns A Promise that resolves to an object containing the favorited products.
   */
  async getFavoritedProducts(req: Request, res: Response, next: NextFunction) {
    const products = await this.productService.getFavoritedProducts(
      req.user!.id!
    );
    setCache(req, createResponse(res, 200, "Top favorited products retrieved successfully", { products }));
  }

  /**
   * Adds a product to the user's list of favorite products.
   * @param req Request object containing the product ID as a parameter.
   * @param res Response object to send the response.
   * @param next NextFunction object to call the next middleware.
   * @returns A Promise that resolves to the added favorite product.
   */
  async addProductToFavorite(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const product = await this.productService.addProductToFavorite(
      parseInt(id),
      req.user!.id!
    );
    createResponse(res, 200, "Add product to favorite success", product);
  }

  /**
   * Deletes a product from the user's list of favorite products.
   * @param req Request object containing the product ID as a parameter.
   * @param res Response object to send the response.
   * @param next NextFunction object to call the next middleware.
   * @returns A Promise that resolves to an object with the deleted product ID.
   */
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
