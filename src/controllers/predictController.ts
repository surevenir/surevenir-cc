import { NextFunction, Request, Response } from "express";
import Controller from "../utils/controllerDecorator";
import createResponse from "../utils/createResponse";
import PredictService from "../services/predictService";

@Controller
class PredictController {
  private predictService: PredictService;

  constructor() {
    this.predictService = new PredictService();
  }

  async predict(req: Request, res: Response, next: NextFunction) {
    const prediction = await this.predictService.predict(req.file);
    createResponse(res, 200, "Prediction success", prediction);
    this.predictService.createHistory(
      req.user!.id!,
      req.file,
      prediction.prediction
    );
  }

  async getUserHistories(req: Request, res: Response, next: NextFunction) {
    const histories = await this.predictService.getUserHistories(req.user!.id!);
    createResponse(
      res,
      200,
      "User predict histories retrieved successfully",
      histories
    );
  }
}

export default new PredictController();
