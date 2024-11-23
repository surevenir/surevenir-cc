import prisma from "../config/database";
import ResponseError from "../utils/responseError";
import { Review } from "@prisma/client";
import MediaService, { MediaData, MediaType } from "./mediaService";

class ReviewService {
  private mediaService: MediaService;

  constructor() {
    this.mediaService = new MediaService();
  } 

  async createReview(review: Review, files: Express.Request["files"]) {
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: review.product_id,
      },
    });

    const existingUser = await prisma.user.findFirst({
      where: {
        id: review.user_id,
      },
    });

    if (!existingProduct && !existingUser) {
      throw new ResponseError(404, "Product and user not found");
    }

    if (!existingProduct) {
      throw new ResponseError(404, "Product not found");
    }

    if (!existingUser) {
      throw new ResponseError(404, "User not found");
    }

    await this.uploadAndSaveMediasIfExist(files, review.id);

    return await prisma.review.create({
      data: review,
    });
  }

  async getAllReviews() {
    return await prisma.review.findMany();
  }

  async getReviewById(id: number) {
    const review = await prisma.review.findUnique({
      where: {
        id,
      },
    });

    if (!review) {
      throw new ResponseError(404, "Review not found");
    }

    return review;
  }

  async updateReview(review: Review) {
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: review.product_id,
      },
    });

    const existingReview = await prisma.review.findFirst({
      where: {
        id: review.id,
      },
    });

    const existingUser = await prisma.user.findFirst({
      where: {
        id: review.user_id,
      },
    });

    if (!existingReview) {
      throw new ResponseError(404, "Review not found");
    }

    if (!existingProduct && !existingUser) {
      throw new ResponseError(404, "Product and user not found");
    }

    if (!existingProduct) {
      throw new ResponseError(404, "Product not found");
    }

    if (!existingUser) {
      throw new ResponseError(404, "User not found");
    }

    return await prisma.review.update({
      where: {
        id: review.id,
      },
      data: review,
    });
  }

  async deleteReviewById(id: number) {
    const existingReview = await prisma.review.findFirst({
      where: {
        id,
      },
    });

    if (!existingReview) {
      throw new ResponseError(404, "Review not found");
    }

    return await prisma.review.delete({
      where: {
        id,
      },
    });
  }

  private async uploadAndSaveMediasIfExist(
    files: Express.Request["files"],
    productId: number
  ) {
    if (files && files.length != 0) {
      const mediaUrls = await Promise.all(
        (files as any).map((file: any) => this.mediaService.uploadMedia(file))
      );

      const mediaData: MediaData[] = mediaUrls.map((mediaUrl) => ({
        url: mediaUrl,
        itemId: productId,
        type: MediaType.REVIEW,
      }));

      await this.mediaService.saveMedias(mediaData);
    }
  }
}

export default ReviewService;
