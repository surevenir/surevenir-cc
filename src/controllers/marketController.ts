import { Request, Response, NextFunction } from "express";
import createResponse from "../utils/createResponse";
import {
  CreateMarketRequest,
  UpdateMarketRequest,
} from "../types/request/marketRequest";
import Controller from "../utils/controllerDecorator";
import MarketService from "../services/marketService";
import setCache from "../utils/setCache";

@Controller
class MarketController {
  private marketService: MarketService;

  /**
   * Constructor
   *
   * Initialize the marketService with a new instance of MarketService
   */
  constructor() {
    this.marketService = new MarketService();
  }

  /**
   * Creates a new market.
   * @param req Request object containing the request body and a single file.
   * @param res Response object to send the response.
   * @param next NextFunction object to call the next middleware.
   * @returns A Promise that resolves to the created market.
   */
  async createMarket(req: Request, res: Response, next: NextFunction) {
    const data: any = CreateMarketRequest.parse(req.body);
    const market = await this.marketService.createMarket(
      {
        ...data,
      },
      req.file
    );
    createResponse(res, 201, "Market created successfully", market);
  }

  /**
   * Adds images to a specified market.
   * @param req Request object containing the market ID as a parameter and the images as files.
   * @param res Response object to send the response.
   * @param next NextFunction object to call the next middleware.
   * @returns A Promise that resolves when images are added successfully.
   */
  async addMarketImages(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const market = await this.marketService.addMarketImages(
      parseInt(id),
      req.files
    );
    createResponse(res, 200, "Market images added successfully", market);
  }

  /**
   * Retrieves all markets.
   * @param req Request object to get the query parameters.
   * @param res Response object to send the response.
   * @param next NextFunction object to call the next middleware.
   * @returns A Promise that resolves to the markets.
   */
  async getAllMarkets(req: Request, res: Response, next: NextFunction) {
    const markets = await this.marketService.getAllMarkets();
    setCache(
      req,
      createResponse(res, 200, "Markets retrieved successfully", markets)
    );
  }

  /**
   * Retrieves a market by ID.
   * @param req Request object containing the market ID as a parameter.
   * @param res Response object to send the response.
   * @param next NextFunction object to call the next middleware.
   * @returns A Promise that resolves to the market with the specified ID.
   */
  async getMarketById(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const market = await this.marketService.getMarketById(parseInt(id));
    setCache(
      req,
      createResponse(res, 200, "Market retrieved successfully", market)
    );
  }

  /**
   * Retrieves a market by its slug.
   * @param req Request object containing the slug as a parameter.
   * @param res Response object to send the response.
   * @param next NextFunction object to call the next middleware.
   * @returns A Promise that resolves to the market with the specified slug.
   */
  async getMarketBySlug(req: Request, res: Response, next: NextFunction) {
    const { slug } = req.params;
    const market = await this.marketService.getMarketBySlug(slug);
    createResponse(res, 200, "Market retrieved successfully", market);
  }

  /**
   * Retrieves the merchants in a specified market.
   * @param req Request object containing the market ID as a parameter.
   * @param res Response object to send the response.
   * @param next NextFunction object to call the next middleware.
   * @returns A Promise that resolves to the list of merchants in the specified market.
   */
  async getMerchantsInMarket(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const merchants = await this.marketService.getMerchantsInMarket(
      parseInt(id)
    );

    setCache(
      req,
      createResponse(
        res,
        200,
        "Merchants in market retrieved successfully",
        merchants
      )
    );
  }

  /**
   * Updates a market by ID.
   * @param req Request object containing the market ID as a parameter and the updated data in the body.
   * @param res Response object to send the response.
   * @param next NextFunction object to call the next middleware.
   * @returns A Promise that resolves to the updated market.
   */
  async updateMarket(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const data: any = UpdateMarketRequest.parse(req.body);

    const file = req.file;

    const market = await this.marketService.updateMarket(
      {
        id: parseInt(id),
        ...data,
      },
      file
    );

    createResponse(res, 200, "Market updated successfully", market);
  }

  /**
   * Deletes a market by ID.
   * @param req Request object containing the market ID as a parameter.
   * @param res Response object to send the response.
   * @param next NextFunction object to call the next middleware.
   * @returns A Promise that resolves to an object with the deleted market ID.
   */
  async deleteMarket(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    await this.marketService.deleteMarketById(parseInt(id));
    createResponse(res, 200, "Market deleted successfully", { id });
  }
}

export default new MarketController();
