import prisma from "../config/database";
import ResponseError from "../utils/responseError";
import { Review } from "@prisma/client";

class ReviewService {
  async createReview(review: Review) {
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

    return prisma.review.create({
      data: {
        ...review,
      },
    });
  }

  async getAllReviews() {
    return prisma.review.findMany();
  }

  async getReviewById(id: number) {
    const review = prisma.review.findUnique({
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

    return prisma.review.update({
      where: {
        id: review.id,
      },
      data: {
        ...review,
        updatedAt: new Date(),
      },
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

    return prisma.review.delete({
      where: {
        id,
      },
    });
  }
}

export default ReviewService;
