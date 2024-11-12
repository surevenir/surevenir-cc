import { z } from "zod";

const CreateProductRequest = z.object({
  name: z.string().min(3),
  description: z.string().min(3).nullable(),
  price: z.number(),
  merchant_id: z.number(),
});

const UpdateProductRequest = z.object({
  name: z.string().min(3).optional(),
  description: z.string().min(3).optional(),
  price: z.number().optional(),
  merchant_id: z.number().optional(),
});

export { CreateProductRequest, UpdateProductRequest };
