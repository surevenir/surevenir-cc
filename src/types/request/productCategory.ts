import { z } from "zod";

const CreateProductCategoryRequest = z.object({
  product_id: z.number(),
  category_id: z.number(),
});

const UpdateProductCategoryRequest = z.object({
  product_id: z.number().optional(),
  category_id: z.number().optional(),
});

export { CreateProductCategoryRequest, UpdateProductCategoryRequest };
