import { Request, Response, NextFunction } from "express";
import createResponse from "../utils/createResponse";
import {
  CreateMerchantRequest,
  UpdateMerchantRequest,
} from "../types/request/merchantRequest";
import Controller from "../utils/controllerDecorator";
import MerchantService from "../services/merchantService";

@Controller
class MerchantController {
  private merchantService: MerchantService;

  /**
   * Initializes the controller with a new instance of the MerchantService.
   */
  constructor() {
    this.merchantService = new MerchantService();
  }

  /**
   * Creates a new merchant.
   * @param req - The request object containing the merchant data and an optional image file.
   * @param res - The response object to send the result of the creation process.
   * @param next - The next middleware function in the stack.
   * @returns A Promise that resolves when the response is sent.
   */
  async createMerchant(req: Request, res: Response, next: NextFunction) {
    const data: any = CreateMerchantRequest.parse(req.body);
    const merchant = await this.merchantService.createMerchant(
      {
        ...data,
        market_id: parseInt(data.market_id),
      },
      req.file
    );
    createResponse(res, 201, "Merchant created successfully", merchant);
  }

  /**
   * Adds images to a specified merchant.
   * @param req - The request object containing the merchant ID as a parameter and the images as files.
   * @param res - The response object to send the result of the operation.
   * @param next - The next middleware function in the stack.
   * @returns A Promise that resolves when images are added successfully and the response is sent.
   */
  async addMerchantImages(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const merchant = await this.merchantService.addMerchantImages(
      parseInt(id),
      req.files
    );
    createResponse(res, 200, "Merchant images added successfully", merchant);
  }

  /**
   * Retrieves all merchants.
   * @param req - The request object to get the query parameters.
   * @param res - The response object to send the result of the operation.
   * @param next - The next middleware function in the stack.
   * @returns A Promise that resolves when the response is sent.
   */
  async getAllMerchants(req: Request, res: Response, next: NextFunction) {
    const merchants = await this.merchantService.getAllMerchants();
    createResponse(res, 200, "Merchants retrieved successfully", merchants);
  }

  async getAllMerchantsByOwner(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const merchants = await this.merchantService.getAllMerchantsByOwner(
      req.user!
    );
    createResponse(res, 200, "Merchants retrieved successfully", merchants);
  }

  /**
   * Retrieves a merchant by its ID.
   * @param req - The request object containing the merchant ID as a parameter.
   * @param res - The response object to send the result of the operation.
   * @param next - The next middleware function in the stack.
   * @returns A Promise that resolves when the response is sent.
   */
  async getMerchantById(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const merchant = await this.merchantService.getMerchantById(parseInt(id));
    createResponse(res, 200, "Merchant retrieved successfully", merchant);
  }

  /**
   * Retrieves a merchant by its slug.
   * @param req - The request object containing the merchant slug as a parameter.
   * @param res - The response object to send the result of the operation.
   * @param next - The next middleware function in the stack.
   * @returns A Promise that resolves when the response is sent.
   */
  async getMerchantBySlug(req: Request, res: Response, next: NextFunction) {
    const { slug } = req.params;
    const merchant = await this.merchantService.getMerchantBySlug(slug);
    createResponse(res, 200, "Merchant retrieved successfully", merchant);
  }

  /**
   * Retrieves the products in a specified merchant.
   * @param req - The request object containing the merchant ID as a parameter.
   * @param res - The response object to send the result of the operation.
   * @param next - The next middleware function in the stack.
   * @returns A Promise that resolves when the response is sent.
   */
  async getProductsInMerchant(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const products = await this.merchantService.getProductsInMerchant(
      parseInt(id)
    );
    createResponse(
      res,
      200,
      "Products in merchant retrieved successfully",
      products
    );
  }

  /**
   * Updates a merchant by ID.
   * @param req - The request object containing the merchant ID as a parameter and the updated data in the body.
   * @param res - The response object to send the response.
   * @param next - The next middleware function in the stack.
   * @returns A Promise that resolves to the updated merchant.
   */
  async updateMerchant(req: Request, res: Response, next: NextFunction) {
    let { id } = req.params;
    const data: any = UpdateMerchantRequest.parse(req.body);
    const merchant = await this.merchantService.updateMerchant(
      {
        id: parseInt(id),
        ...data,
        market_id: parseInt(data.market_id),
      },
      req.file
    );
    createResponse(res, 200, "Merchant updated successfully", merchant);
  }

  /**
   * Deletes a merchant by ID.
   * @param req - The request object containing the merchant ID as a parameter.
   * @param res - The response object to send the response.
   * @param next - The next middleware function in the stack.
   * @returns A Promise that resolves to an object with the deleted merchant ID.
   */
  async deleteMerchant(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    await this.merchantService.deleteMerchantById(parseInt(id));
    createResponse(res, 200, "Merchant deleted successfully", { id });
  }
}

export default new MerchantController();
