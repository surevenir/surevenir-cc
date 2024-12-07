import axios, { AxiosResponse } from "axios";
import prisma from "../config/database";
import ResponseError from "../utils/responseError";
import MediaService from "./mediaService";

class PredictService {
  mediaService: MediaService;

  constructor() {
    this.mediaService = new MediaService();
  }

  async predict(userId: string, file: Express.Request["file"]) {
    let prediction: AxiosResponse<any, any>;
    try {
      prediction = await axios.post(process.env.ML_API_URL! + "/predict", {
        image: file?.buffer.toString("base64"),
        token: process.env.ML_API_TOKEN,
      });
    } catch (error) {
      console.error("Error predicting product:", error);
      throw new ResponseError(500, "Failed to predict");
    }

    const mediaUrl = await this.mediaService.uploadMedia(file!);
    const createdHistory = await prisma.history.create({
      data: {
        user_id: userId,
        image_url: mediaUrl,
        predict: prediction.data.data.result,
        accuration: prediction.data.data.accuration,
      },
    });

    const category = await prisma.category.findFirst({
      where: {
        name: prediction.data.data.result,
      },
    });

    return {
      prediction: prediction.data.data.result,
      history: createdHistory,
      category: category,
    };
  }

  async getUserHistories(userId: string) {
    const result = await prisma.$queryRaw`
      SELECT 
        h.*, 
        c.name as category_name,
        c.description as category_description
        c.range_price as category_range_price
      FROM history h
      JOIN category c ON h.predict = c.name
      WHERE h.user_id = ${userId}
      ORDER BY h.created_at DESC
    `;
    
    return result;
  }
}

export default PredictService;