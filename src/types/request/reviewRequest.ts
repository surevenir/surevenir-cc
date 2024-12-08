import { z } from "zod";

const CreateReviewRequest = z.object({
  rating: z.string().refine((value) => /^[1-5]$/.test(value), {
    message: "rating must be a number between 1 and 5",
  }),
  comment: z.string(),
  product_id: z.string().refine((value) => /^\d+$/.test(value), {
    message: "product_id must be a number",
  }),
});

const UpdateReviewRequest = z.object({
  rating: z.number().min(1).max(5).optional(),
  comment: z.string().optional(),
  user_id: z.string().optional(),
  product_id: z.number().optional(),
});

export { CreateReviewRequest, UpdateReviewRequest };
