import { Request, Response, NextFunction } from "express";
import createResponse from "../utils/createResponse";

import Controller from "../utils/controllerDecorator";
import MediaService from "../services/mediaService";

@Controller
class MediaController {
  private mediaService: MediaService;

  /**
   * Creates a new MediaController instance.
   *
   * @remarks
   * This constructor is annotated with the `@Controller` decorator, which
   * registers the class as a controller with the Express application.
   */
  constructor() {
    this.mediaService = new MediaService();
  }

  /**
   * Deletes a media item from Google Cloud Storage and the database.
   *
   * @remarks
   * This endpoint is accessible only to authenticated admin users.
   *
   * @param req - The Express Request object.
   * @param res - The Express Response object.
   * @param next - The Express NextFunction object.
   */

  async deleteMedia(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { url } = req.query;

    if (typeof url !== "string") {
      createResponse(res, 400, "URL is required and must be a string", {});
    }

    await this.mediaService.deleteMediaByUrl(url as string);
    createResponse(res, 200, "Media deleted successfully", {});
  }
}

export default new MediaController();
