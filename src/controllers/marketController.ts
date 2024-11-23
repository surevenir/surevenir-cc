import { Request, Response, NextFunction } from "express";
import createResponse from "../utils/createResponse";
import {
  CreateMarketRequest,
  UpdateMarketRequest,
} from "../types/request/market";
import Controller from "../utils/controllerDecorator";
import MarketService from "../services/marketService";

@Controller
class MarketController {
  private marketService: MarketService;

  constructor() {
    this.marketService = new MarketService();
  }

  async createMarket(req: Request, res: Response, next: NextFunction) {
    const data: any = CreateMarketRequest.parse(req.body);
    const market = await this.marketService.createMarket(data);
    createResponse(res, 201, "Market created successfully", market);
  }

  async getAllMarkets(req: Request, res: Response, next: NextFunction) {
    const markets = await this.marketService.getAllMarkets();
    createResponse(res, 200, "Markets retrieved successfully", markets);
  }

  async getMarketById(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const market = await this.marketService.getMarketById(parseInt(id));
    createResponse(res, 200, "Market retrieved successfully", market);
  }

  async getMerchantsInMarket(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const merchants = await this.marketService.getMerchantsInMarket(parseInt(id));
    createResponse(res, 200, "Merchants in market retrieved successfully", merchants);
  }

  async updateMarket(req: Request, res: Response, next: NextFunction) {
    let { id } = req.params;
    const data: any = UpdateMarketRequest.parse(req.body);

    const market = await this.marketService.updateMarket({
      id: parseInt(id),
      ...data,
    });
    createResponse(res, 200, "Market updated successfully", market);
  }

  async deleteMarket(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    await this.marketService.deleteMarketById(parseInt(id));
    createResponse(res, 200, "Market deleted successfully", { id });
  }
}

export default new MarketController();
