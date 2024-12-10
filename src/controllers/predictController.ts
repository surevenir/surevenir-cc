import { NextFunction, Request, Response } from "express";
import Controller from "../utils/controllerDecorator";
import createResponse from "../utils/createResponse";
import PredictService from "../services/predictService";

@Controller
class PredictController {
  private predictService: PredictService;

  /**
   * Creates a new PredictController with a new PredictService
   */
  constructor() {
    this.predictService = new PredictService();
  }

  /**
   * Predict the product category from the given image.
   * @param req The request containing the image to predict.
   * @param res The response to send the result.
   * @param next The next function to call.
   * @returns A Promise that resolves to nothing.
   */
  async predict(req: Request, res: Response, next: NextFunction) {
    const prediction = await this.predictService.predict(req.file);
    createResponse(res, 200, "Prediction success", prediction);
    this.predictService.createHistory(
      req.user!.id!,
      req.file,
      prediction.prediction
    );
  }

  /**
   * Retrieves the predict histories for a user.
   * @param req The request containing the user that wants to retrieve histories.
   * @param res The response to send the result.
   * @param next The next function to call.
   * @returns A Promise that resolves to nothing.
   */
  async getUserHistories(req: Request, res: Response, next: NextFunction) {
    const histories = await this.predictService.getUserHistories(req.user!.id!);
    createResponse(
      res,
      200,
      "User predict histories retrieved successfully",
      histories
    );
  }

  /**
   * Retrieves the top scanner data.
   * @param req The incoming request object.
   * @param res The response object to send the result.
   * @param next The next function to call in the middleware chain.
   * @returns A Promise that resolves to an object containing the top scanner information.
   */
  async getTopScanner(req: Request, res: Response, next: NextFunction) {
    const topScanner = await this.predictService.getTopScanner();
    createResponse(res, 200, "Top scanner retrieved successfully", topScanner);
  }

  /**
   * Deletes a predict history for a user.
   * @param req The request containing the id of the history to delete in the params.
   * @param res The response to send the result.
   * @param next The next function to call.
   * @returns A Promise that resolves to nothing.
   */
  async deleteHistory(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    await this.predictService.deleteHistoryById(parseInt(id));
    createResponse(res, 200, "History deleted successfully", { id });
  }
}

export default new PredictController();
