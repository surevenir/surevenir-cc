import { z } from "zod";

const CreateProductRequest = z.object({
  name: z.string().min(3),
  description: z.string().min(3).nullable(),
  price: z.string().refine((value) => /^\d+$/.test(value), {
    message: "price must be a number",
  }),
  merchant_id: z.string().refine((value) => /^\d+$/.test(value), {
    message: "merchant_id must be a number",
  }),
  category_ids: z.string().refine((value) => /^\d+(,\d+)*$/.test(value), {
    message: "category_ids must be a comma separated list of numbers",
  }),
});

const UpdateProductRequest = z.object({
  name: z.string().min(3).optional(),
  description: z.string().min(3).optional(),
  price: z.number().optional(),
  merchant_id: z.number().optional(),
  category_ids: z.array(z.number()).optional(),
});

export { CreateProductRequest, UpdateProductRequest };
