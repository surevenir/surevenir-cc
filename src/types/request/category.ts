import { z } from "zod";

const CreateCategoryRequest = z.object({
  name: z.string().min(3),
  description: z.string().min(3).nullish(),
  range_price: z.string().min(3).nullish(),
});

const UpdateCategoryRequest = z.object({
  name: z.string().min(3).optional(),
});

export { CreateCategoryRequest, UpdateCategoryRequest };
