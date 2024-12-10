import { Request, Response, NextFunction } from "express";
import createResponse from "../utils/createResponse";
import {
  CreateReviewRequest,
  UpdateReviewRequest,
} from "../types/request/reviewRequest";
import Controller from "../utils/controllerDecorator";
import ReviewService from "../services/reviewService";
import { PubSubTopic } from "../types/enum/dbEnum";
import { publishMessage } from "../config/pubSubClient";

@Controller
class ReviewController {
  private reviewService: ReviewService;

  /**
   * Initializes a new instance of the ReviewController class.
   * @constructor
   */
  constructor() {
    this.reviewService = new ReviewService();
  }

  /**
   * Creates a new review for a product.
   *
   * This method parses the request body to extract review data,
   * validates it, and calls the review service to persist the review.
   * It also publishes a message to the review topic indicating
   * that a review has been created.
   *
   * @param req - The incoming request object containing user and review data.
   * @param res - The response object to send the result of the creation process.
   * @param next - The next middleware function in the stack.
   */
  async createReview(req: Request, res: Response, next: NextFunction) {
    const data: any = CreateReviewRequest.parse(req.body);
    const review = await this.reviewService.createReview(
      {
        ...data,
        rating: parseInt(data.rating),
        product_id: parseInt(data.product_id),
        user_id: req.user!.id,
      },
      req.user!,
      req.files
    );

    const message = `User ${req.user?.full_name} created a review for product ${data.product_id}.`;
    const attributes = {
      eventType: "REVIEW_CREATE",
      source: "reviewService",
      userId: req.user?.id?.toString() || "unknown",
      userName: req.user?.full_name || "unknown",
      productId: data.product_id.toString(),
      rating: data.rating.toString(),
      priority: "normal",
      timestamp: new Date().toISOString(),
    };

    const messageId = await publishMessage(
      message,
      PubSubTopic.REVIEW,
      attributes
    );
    console.log(`Pesan berhasil dikirim dengan ID: ${messageId}`);

    createResponse(res, 201, "Review created successfully", review);
  }

  /**
   * Retrieves all reviews from the database.
   *
   * This method is called when a GET request is made to /reviews.
   * It retrieves all reviews from the review service and sends a response
   * with the reviews list and a 200 status code.
   *
   * @param req - The incoming request object.
   * @param res - The response object to send the result of the retrieval process.
   * @param next - The next middleware function in the stack.
   */
  async getAllReviews(req: Request, res: Response, next: NextFunction) {
    const reviews = await this.reviewService.getAllReviews();
    createResponse(res, 200, "Reviews retrieved successfully", reviews);
  }

  /**
   * Retrieves a review by ID.
   *
   * This method is called when a GET request is made to /reviews/:id.
   * It retrieves a review from the review service and sends a response
   * with the review and a 200 status code.
   *
   * @param req - The incoming request object containing the review ID as a parameter.
   * @param res - The response object to send the result of the retrieval process.
   * @param next - The next middleware function in the stack.
   */
  async getReviewById(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const review = await this.reviewService.getReviewById(parseInt(id));
    createResponse(res, 200, "Review retrieved successfully", review);
  }

  /**
   * Updates a review by ID.
   *
   * This method is called when a PATCH request is made to /reviews/:id.
   * It updates a review in the review service and sends a response
   * with the updated review and a 200 status code.
   *
   * @param req - The incoming request object containing the review ID as a parameter
   *              and the updated data in the body.
   * @param res - The response object to send the result of the update process.
   * @param next - The next middleware function in the stack.
   */
  async updateReview(req: Request, res: Response, next: NextFunction) {
    let { id } = req.params;
    const data: any = UpdateReviewRequest.parse(req.body);
    const review = await this.reviewService.updateReview({
      id: parseInt(id),
      ...data,
    });
    createResponse(res, 200, "Review updated successfully", review);
  }

  /**
   * Deletes a review by ID.
   *
   * This method is called when a DELETE request is made to /reviews/:id.
   * It deletes a review from the review service and sends a response
   * with the deleted review ID and a 200 status code.
   *
   * @param req - The incoming request object containing the review ID as a parameter.
   * @param res - The response object to send the result of the deletion process.
   * @param next - The next middleware function in the stack.
   */
  async deleteReview(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    await this.reviewService.deleteReviewById(parseInt(id), req.user!);
    createResponse(res, 200, "Review deleted successfully", { id });
  }
}

export default new ReviewController();
