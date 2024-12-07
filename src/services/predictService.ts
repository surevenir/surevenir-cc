import axios, { AxiosResponse } from "axios";
import prisma from "../config/database";
import ResponseError from "../utils/responseError";
import MediaService, { MediaType } from "./mediaService";
import FormData from "form-data";

class PredictService {
  mediaService: MediaService;

  constructor() {
    this.mediaService = new MediaService();
  }

  async predict(userId: string, file: Express.Request["file"]) {
    if (!file) {
      throw new Error("No file provided for prediction");
    }

    let prediction: AxiosResponse<any, any>;

    try {
      const formData = new FormData();
      formData.append("image", file.buffer, file.originalname);
      formData.append("token", process.env.ML_API_TOKEN);

      console.log("API_ML_ENDPOINT:", process.env.ML_API_URL! + "/predict");
      console.log("TOKEN:", process.env.ML_API_TOKEN);

      prediction = await axios.post(
        process.env.ML_API_URL! + "/predict",
        formData,
        {
          headers: {
            ...formData.getHeaders(),
          },
        }
      );

      console.log("PREDICTION:", prediction.data);
    } catch (error) {
      console.error("Error predicting product:", error);
      throw new ResponseError(500, "Failed to predict");
    }

    const mediaUrl = await this.mediaService.uploadMedia(file!);
    await prisma.history.create({
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

    if (!category) {
      throw new ResponseError(404, "Category not found");
    }

    let relatedProducts = await prisma.product.findMany({
      where: {
        product_categories: {
          some: {
            category_id: category!.id,
          },
        },
      },
      include: {
        merchant: {
          select: {
            id: true,
            name: true,
            profile_image_url: true,
          },
        },
      },
    });

    const imagesUrl = await prisma.images.findMany({
      where: {
        item_id: {
          in: relatedProducts.map((product) => product.id),
        },
        type: MediaType.PRODUCT,
      },
    });

    relatedProducts = relatedProducts.map((product) => ({
      ...product,
      images: imagesUrl
        .filter((image) => image.item_id === product.id)
        .map((image) => image.url),
    }));

    return {
      image_url: mediaUrl,
      prediction: prediction.data.data,
      category: category,
      related_products: relatedProducts,
    };
  }

  async getUserHistories(userId: string) {
    const result = await prisma.$queryRaw`
      SELECT 
        h.*, 
        c.name as category_name,
        c.description as category_description,
        c.range_price as category_range_price
      FROM histories h
      JOIN categories c ON h.predict = c.name
      WHERE h.user_id = ${userId}
      ORDER BY h.createdAt DESC
    `;

    return result;
  }
}

export default PredictService;
