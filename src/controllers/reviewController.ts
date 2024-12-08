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

  constructor() {
    this.reviewService = new ReviewService();
  }

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

  async getAllReviews(req: Request, res: Response, next: NextFunction) {
    const reviews = await this.reviewService.getAllReviews();
    createResponse(res, 200, "Reviews retrieved successfully", reviews);
  }

  async getReviewById(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const review = await this.reviewService.getReviewById(parseInt(id));
    createResponse(res, 200, "Review retrieved successfully", review);
  }

  async updateReview(req: Request, res: Response, next: NextFunction) {
    let { id } = req.params;
    const data: any = UpdateReviewRequest.parse(req.body);
    const review = await this.reviewService.updateReview({
      id: parseInt(id),
      ...data,
    });
    createResponse(res, 200, "Review updated successfully", review);
  }

  async deleteReview(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    await this.reviewService.deleteReviewById(parseInt(id), req.user!);
    createResponse(res, 200, "Review deleted successfully", { id });
  }
}

export default new ReviewController();
