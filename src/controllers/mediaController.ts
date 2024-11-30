import { Request, Response, NextFunction } from "express";
import createResponse from "../utils/createResponse";

import Controller from "../utils/controllerDecorator";
import MediaService from "../services/mediaService";

@Controller
class MediaController {
  private mediaService: MediaService;

  constructor() {
    this.mediaService = new MediaService();
  }

  async deleteMedia(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { url } = req.query; // Ambil URL dari query string

    if (typeof url !== "string") {
      createResponse(res, 400, "URL is required and must be a string", {});
    }

    await this.mediaService.deleteMediaByUrl(url as string);
    createResponse(res, 200, "Media deleted successfully", {});
  }
}

export default new MediaController();
