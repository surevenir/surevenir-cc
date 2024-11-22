import { Request, Response, NextFunction } from "express";
import createResponse from "../utils/createResponse";
import {
  CreateMerchantRequest,
  UpdateMerchantRequest,
} from "../types/request/merchant";
import Controller from "../utils/controllerDecorator";
import MerchantService from "../services/merchantService";
import UserService from "../services/userService";
import MarketService from "../services/marketService";

@Controller
class MerchantController {
  merchantService: MerchantService;
  userService: UserService;
  marketService: MarketService;

  constructor() {
    this.merchantService = new MerchantService();
    this.userService = new UserService();
    this.marketService = new MarketService();
  }

  async createMerchant(req: Request, res: Response, next: NextFunction) {
    const data: any = CreateMerchantRequest.parse(req.body);
    const merchant = await this.merchantService.createMerchant(data);
    createResponse(res, 201, "Merchant created successfully", merchant);
  }

  async getAllMerchants(req: Request, res: Response, next: NextFunction) {
    const merchants = await this.merchantService.getAllMerchants();
    if (merchants.length > 0) {
      createResponse(res, 200, "Merchants retrieved successfully", merchants);
    } else {
      createResponse(res, 404, "Merchants not found", []);
    }
  }

  async getMerchantById(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const merchant = await this.merchantService.getMerchantById(parseInt(id));
    if (merchant !== null) {
      createResponse(res, 200, "Merchant retrieved successfully", merchant);
    } else {
      createResponse(res, 404, "Merchant not found", []);
    }
  }

  async updateMerchant(req: Request, res: Response, next: NextFunction) {
    let { id } = req.params;
    const data: any = UpdateMerchantRequest.parse(req.body);
    const Merchant = await this.merchantService.updateMerchant({
      id: parseInt(id),
      ...data,
    });
    createResponse(res, 200, "Merchant updated successfully", Merchant);
  }

  async deleteMerchant(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    await this.merchantService.deleteMerchantById(parseInt(id));
    createResponse(res, 200, "Merchant deleted successfully", { id });
  }
}

export default new MerchantController();
