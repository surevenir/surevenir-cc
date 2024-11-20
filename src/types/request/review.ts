import { z } from "zod";

const CreateReviewRequest = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string(),
  user_id: z.string(),
  product_id: z.number(),
});

const UpdateReviewRequest = z.object({
  rating: z.number().min(1).max(5).optional(),
  comment: z.string().optional(),
  user_id: z.string().optional(),
  product_id: z.number().optional(),
});

export { CreateReviewRequest, UpdateReviewRequest };
