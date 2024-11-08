import { z } from "zod";

const CreateCategoryRequest = z.object({
  name: z.string().min(3),
});

const UpdateCategoryRequest = z.object({
  name: z.string().min(3).optional(),
});

export { CreateCategoryRequest, UpdateCategoryRequest };
