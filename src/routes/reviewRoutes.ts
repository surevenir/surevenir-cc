import express from "express";
import ReviewController from "../controllers/reviewController";
import authorizeAdmin from "../middlewares/authorizeAdmin";
import authenticate from "../middlewares/authenticate";
import multer from "../middlewares/multer";

const reviewRouter = express.Router();

reviewRouter.get("/", authenticate, ReviewController.getAllReviews);
reviewRouter.get("/:id", authenticate, ReviewController.getReviewById);
reviewRouter.post(
  "/",
  authenticate,
  authorizeAdmin,
  multer.array("images", 10),
  ReviewController.createReview
);
reviewRouter.patch(
  "/:id",
  authenticate,
  authorizeAdmin,
  ReviewController.updateReview
);
reviewRouter.delete(
  "/:id",
  authenticate,
  authorizeAdmin,
  ReviewController.deleteReview
);

export default reviewRouter;
