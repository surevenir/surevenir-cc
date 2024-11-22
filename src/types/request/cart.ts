import { z } from "zod";

const CreateCartRequest = z.object({
  user_id: z.string(),
  product_id: z.number(),
  quantity: z.number().min(0),
  is_checkout: z.boolean().default(false),
  total_price: z.number(),
});

const UpdateCartRequest = z.object({
  user_id: z.string().optional(),
  product_id: z.number().optional(),
  quantity: z.number().min(0).optional(),
  is_checkout: z.boolean().default(false).optional(),
  total_price: z.number().optional(),
});

export { CreateCartRequest, UpdateCartRequest };
