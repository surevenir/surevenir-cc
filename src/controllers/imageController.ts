import { Request, Response, NextFunction } from "express";
import createResponse from "../utils/createResponse";
import {
  CreateImageRequest,
  UpdateImageRequest,
} from "../types/request/images";
import Controller from "../utils/controllerDecorator";
import ImageService from "../services/imageService";
import { v4 as uuidv4 } from "uuid";
import { uploadImageToBucket } from "../utils/fileUpload";

@Controller
class ImageController {
  imageService: ImageService;

  constructor() {
    this.imageService = new ImageService();
  }

  async createImage(req: Request, res: Response, next: NextFunction) {
    // const data: any = CreateImageRequest.parse(req.body);
    const data: any = CreateImageRequest.parse(req.body);
    console.log("datasssssssssssssssssssssssssssssssssss");
    console.log(data);
    console.log(req.files);

    if (req.file) {
      const fileName = `${uuidv4()}-${req.file.originalname}`;
      const publicUrl = await uploadImageToBucket(
        req.file.buffer,
        fileName,
        req.file.mimetype
      );
      data.url = publicUrl;
    }

    const image = await this.imageService.createImage(data);
    createResponse(res, 201, "Image created successfully", image);
  }

  async getAllImages(req: Request, res: Response, next: NextFunction) {
    const images = await this.imageService.getAllImages();
    if (images.length > 0) {
      createResponse(res, 200, "Images retrieved successfully", images);
    } else {
      createResponse(res, 404, "Images not found", []);
    }
  }

  async getImageById(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const image = await this.imageService.getImageById(parseInt(id));
    if (image !== null) {
      createResponse(res, 200, "Image retrieved successfully", image);
    } else {
      createResponse(res, 404, "Image not found", []);
    }
  }

  async updateImage(req: Request, res: Response, next: NextFunction) {
    let { id } = req.params;
    const data: any = UpdateImageRequest.parse(req.body);
    const Image = await this.imageService.updateImage({
      id: parseInt(id),
      ...data,
    });
    createResponse(res, 200, "Image updated successfully", Image);
  }

  async deleteImage(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    await this.imageService.deleteImageById(parseInt(id));
    createResponse(res, 200, "Image deleted successfully", { id });
  }
}

export default new ImageController();
