import axios, { AxiosResponse } from "axios";
import prisma from "../config/database";
import ResponseError from "../utils/responseError";
import MediaService, { MediaType } from "./mediaService";
import FormData from "form-data";

type Prediction = {
  result: string;
  accuration: number;
};

class PredictService {
  mediaService: MediaService;

  /**
   * Initializes a new instance of the PredictService class.
   * Sets up the mediaService for handling media-related operations.
   */
  constructor() {
    this.mediaService = new MediaService();
  }

  /**
   * Predicts the product category from the given image.
   * @param file The image to predict.
   * @returns A Promise that resolves to an object containing the prediction result, the category object, and a list of related products.
   * The prediction result is an object with two properties: result (string) and accuracy (number).
   * The category object is the category that the product belongs to.
   * The related products are products that belong to the same category, including the product's merchant, product name, and images.
   * @throws ResponseError if the image is not provided, or if the prediction fails.
   */
  async predict(file: Express.Request["file"]) {
    if (!file) {
      throw new ResponseError(400, "Image is required");
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
      take: 10,
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
      prediction: prediction.data.data as Prediction,
      category: category,
      related_products: relatedProducts,
    };
  }

  /**
   * Creates a new history for a user.
   * @param userId The ID of the user who submitted the image.
   * @param file The image to predict.
   * @param prediction The prediction result object from the predict function.
   * @returns A Promise that resolves to nothing.
   * @throws ResponseError if the image is not provided or if the prediction fails.
   */
  async createHistory(
    userId: string,
    file: Express.Request["file"],
    prediction: Prediction
  ) {
    const mediaUrl = await this.mediaService.uploadMedia(file!);
    await prisma.history.create({
      data: {
        user_id: userId,
        image_url: mediaUrl,
        predict: prediction.result,
        accuration: prediction.accuration,
      },
    });
  }

  /**
   * Retrieves the predict histories of a user.
   * @param userId The ID of the user to retrieve histories for.
   * @returns A Promise that resolves to an array of history objects, each containing the history ID, user ID, image URL, prediction result, accuracy and category name, description and range price.
   */
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

  /**
   * Retrieves the top scanner data.
   * @returns A Promise that resolves to an array of objects, each containing the user ID, user name, email, profile image URL, history count and points.
   * The array is sorted by the history count in descending order.
   */
  async getTopScanner() {
    const result = await prisma.$queryRaw<
      {
        user_id: string;
        user_name: string;
        history_count: bigint;
      }[]
    >`
      SELECT 
        u.id as user_id,
        COALESCE(u.full_name, 'Unknown') as user_name,
        COALESCE(u.email, 'Unknown') as email,
        COALESCE(u.profile_image_url, 'Unknown') as profile_image_url,
        COUNT(h.id) as history_count
      FROM histories h
      JOIN users u ON h.user_id = u.id
      GROUP BY u.id, u.full_name
      ORDER BY history_count DESC
    `;

    const processedResult = result.map((row) => ({
      ...row,
      history_count: Number(row.history_count),
      points: Number(row.history_count) * 100,
    }));

    return processedResult;
  }

  /**
   * Deletes a predict history by its ID.
   * @param id The ID of the history to delete.
   * @returns A Promise that resolves to the deleted history object.
   * @throws ResponseError if the history is not found, if there is a failure in
   * deleting the associated media, or if there is a failure in deleting the history.
   */
  async deleteHistoryById(id: number) {
    const existingHistory = await prisma.history.findFirst({
      where: {
        id,
      },
    });

    if (!existingHistory) {
      throw new ResponseError(404, "History not found");
    }

    try {
      if (existingHistory.image_url) {
        await this.mediaService.deleteMediaFromGCSByUrl(
          existingHistory.image_url
        );
      }

      console.log("Media for history deleted successfully.");
    } catch (error) {
      console.error("Error deleting media for history:", error);
      throw new ResponseError(500, "Failed to delete media for history");
    }

    try {
      const deletedHistory = await prisma.history.delete({
        where: {
          id,
        },
      });
      console.log("History deleted successfully:", deletedHistory);
      return deletedHistory;
    } catch (error) {
      console.error("Error deleting history:", error);
      throw new ResponseError(500, "Failed to delete history");
    }
  }
}

export default PredictService;
