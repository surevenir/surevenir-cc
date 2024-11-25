import { z } from "zod";

const CreateMerchantRequest = z.object({
  name: z.string().min(3),
  description: z.string().min(3).nullable(),
  longitude: z.string().min(3).nullable(),
  latitude: z.string().min(3).nullable(),
  user_id: z.string(),
  market_id: z.number(),
});

const UpdateMerchantRequest = z.object({
  name: z.string().min(3).optional(),
  description: z.string().min(3).optional(),
  longitude: z.string().min(3).optional(),
  latitude: z.string().min(3).optional(),
  user_id: z.string().optional(),
  market_id: z.number().optional(),
});

export { CreateMerchantRequest, UpdateMerchantRequest };
