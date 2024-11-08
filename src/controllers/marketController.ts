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
  marketService: MarketService;

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
    createResponse(res, 200, "Admin users retrieved successfully", market);
  }

  // async updateUser(req: Request, res: Response, next: NextFunction) {
  //   const { id } = req.params;
  //   const data: any = UpdateUserRequest.parse(req.body);
  //   const user = await this.userService.updateUser({ id, ...data });
  //   createResponse(res, 200, "User updated successfully", user);
  // }

  // async deleteUser(req: Request, res: Response, next: NextFunction) {
  //   const { id } = req.params;
  //   await this.userService.deleteUserById(id);
  //   createResponse(res, 200, "User deleted successfully", { id });
  // }
}

export default new MarketController();
