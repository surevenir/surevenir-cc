import prisma from "../config/database";
import ResponseError from "../utils/responseError";
import { Review, User } from "@prisma/client";
import MediaService, { MediaData, MediaType } from "./mediaService";
import { CheckoutStatus } from "../types/enum/dbEnum";

class ReviewService {
  private mediaService: MediaService;

  /**
   * Constructs a new ReviewService.
   * Initializes the MediaService instance which is used to
   * interact with the media table in the database.
   * @class ReviewService
   * @constructor
   */
  constructor() {
    this.mediaService = new MediaService();
  }

  /**
   * Creates a new review for a product.
   *
   * This method is called when a user wants to create a review
   * for a product. It validates the request body, checks if the
   * product and user exist in the database, and also checks if the
   * user has ordered and completed the checkout process for the
   * product. If all the conditions are met, it will create a new
   * review and upload the images if any.
   *
   * @param review The review data to be created.
   * @param user The user who is creating the review.
   * @param files The images to be uploaded.
   *
   * @returns The created review data and its uploaded images.
   * @throws {ResponseError} If the product and user do not exist in the database.
   * @throws {ResponseError} If the user has already reviewed the product.
   * @throws {ResponseError} If the user has not ordered and completed the checkout
   *                         process for the product.
   */
  async createReview(
    review: Review,
    user: User,
    files: Express.Request["files"]
  ) {
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: review.product_id,
      },
    });

    const existingUser = await prisma.user.findFirst({
      where: {
        id: user.id,
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

    const existingReview = await prisma.review.findFirst({
      where: {
        product_id: review.product_id,
        user_id: user.id,
      },
    });
    if (existingReview) {
      throw new ResponseError(400, "You already reviewed this product");
    }

    const existingCheckouts = await prisma.checkoutDetails.findMany({
      where: {
        product_id: review.product_id,
        checkout: {
          user_id: user.id,
          status: CheckoutStatus.COMPLETED,
        },
      },
    });
    if (existingCheckouts.length === 0) {
      throw new ResponseError(
        400,
        "You need to order and completetly checkout to review this product"
      );
    }

    const result = await prisma.review.create({
      data: review,
    });

    const images = await this.uploadAndSaveMediasIfExist(files, result.id);

    return {
      ...result,
      images,
    };
  }

  /**
   * Retrieves all reviews from the database.
   *
   * @returns A Promise that resolves to an array of all reviews in the database.
   */
  async getAllReviews() {
    return await prisma.review.findMany();
  }

  /**
   * Retrieves a review by its ID.
   *
   * @param id The ID of the review to be retrieved.
   * @returns A Promise that resolves to the review with the specified ID,
   *          or throws a ResponseError with a 404 status if the review is not found.
   */
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

  /**
   * Updates a review by its ID.
   *
   * This method is called when a PATCH request is made to /reviews/:id.
   * It updates a review in the review service and sends a response
   * with the updated review and a 200 status code.
   *
   * @param review The review data to be updated.
   *
   * @returns The updated review data.
   * @throws {ResponseError} If the review is not found.
   * @throws {ResponseError} If the product and user are not found.
   * @throws {ResponseError} If the product is not found.
   * @throws {ResponseError} If the user is not found.
   */
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

  /**
   * Deletes a review by ID.
   * @param id The ID of the review to delete.
   * @param user The user who made the review.
   * @returns The deleted review.
   * @throws ResponseError if the review is not found.
   */
  async deleteReviewById(id: number, user: User) {
    const existingReview = await prisma.review.findFirst({
      where: {
        id,
        user_id: user.id,
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

  /**
   * Uploads and saves media files associated with a review if they exist.
   *
   * This method is responsible for uploading media files to a storage service
   * and saving their metadata in the database. It is used when media files are
   * provided as part of a review.
   *
   * @param files - The media files to be uploaded and associated with the review.
   * @param productId - The ID of the product for which the media files are being uploaded.
   *
   * @returns A promise that resolves to an array of saved media data, including URLs and metadata.
   *
   * @throws ResponseError if there is an issue during the upload or save process.
   */
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
      return mediaData;
    }
  }
}

export default ReviewService;
