import { Request, Response, NextFunction } from "express";
import createResponse from "../utils/createResponse";
import {
  CreateMerchantRequest,
  UpdateMerchantRequest,
} from "../types/request/merchant";
import Controller from "../utils/controllerDecorator";
import MerchantService from "../services/merchantService";

@Controller
class MerchantController {
  private merchantService: MerchantService;

  constructor() {
    this.merchantService = new MerchantService();
  }

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

  async addMerchantImages(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const merchant = await this.merchantService.addMerchantImages(
      parseInt(id),
      req.files
    );
    createResponse(res, 200, "Merchant images added successfully", merchant);
  }

  async getAllMerchants(req: Request, res: Response, next: NextFunction) {
    const merchants = await this.merchantService.getAllMerchants();
    createResponse(res, 200, "Merchants retrieved successfully", merchants);
  }

  async getMerchantById(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const merchant = await this.merchantService.getMerchantById(parseInt(id));
    createResponse(res, 200, "Merchant retrieved successfully", merchant);
  }

  async getMerchantBySlug(req: Request, res: Response, next: NextFunction) {
    const { slug } = req.params;
    const merchant = await this.merchantService.getMerchantBySlug(slug);
    createResponse(res, 200, "Merchant retrieved successfully", merchant);
  }

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

  async deleteMerchant(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    await this.merchantService.deleteMerchantById(parseInt(id));
    createResponse(res, 200, "Merchant deleted successfully", { id });
  }
}

export default new MerchantController();
