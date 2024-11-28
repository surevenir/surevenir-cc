import { z } from "zod";

const CreateCategoryRequest = z.object({
  name: z.string().min(3),
  description: z.string(), 
  range_price: z.string(),
});

const UpdateCategoryRequest = z.object({
  name: z.string().min(3).optional(),
  description: z.string().optional(),
  range_price: z.string().optional(),
});

export { CreateCategoryRequest, UpdateCategoryRequest };
