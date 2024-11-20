import { Request, Response, NextFunction } from "express";
import createResponse from "../utils/createResponse";
import {
  CreateReviewRequest,
  UpdateReviewRequest,
} from "../types/request/review";
import Controller from "../utils/controllerDecorator";
import ReviewService from "../services/reviewService";

@Controller
class ReviewController {
  reviewService: ReviewService;

  constructor() {
    this.reviewService = new ReviewService();
  }

  async createReview(req: Request, res: Response, next: NextFunction) {
    const data: any = CreateReviewRequest.parse(req.body);
    const review = await this.reviewService.createReview(data);
    createResponse(res, 201, "Review created successfully", review);
  }

  async getAllReviews(req: Request, res: Response, next: NextFunction) {
    const reviews = await this.reviewService.getAllReviews();
    if (reviews.length > 0) {
      createResponse(res, 200, "Reviews retrieved successfully", reviews);
    } else {
      createResponse(res, 404, "Reviews not found", []);
    }
  }

  async getReviewById(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const review = await this.reviewService.getReviewById(parseInt(id));
    if (review !== null) {
      createResponse(res, 200, "Review retrieved successfully", review);
    } else {
      createResponse(res, 404, "Review not found", []);
    }
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
    await this.reviewService.deleteReviewById(parseInt(id));
    createResponse(res, 200, "Review deleted successfully", { id });
  }
}

export default new ReviewController();
