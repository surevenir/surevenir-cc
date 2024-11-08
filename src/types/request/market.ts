import { z } from "zod";

const CreateMarketRequest = z.object({
  name: z.string().min(3),
  description: z.string().min(3).nullable(),
  longitude: z.string().min(3).nullable(),
  latitude: z.string().min(3).nullable(),
});

const UpdateMarketRequest = z.object({
  name: z.string().min(3).optional(),
  description: z.string().min(3).optional(),
  longitude: z.string().min(3).optional(),
  latitude: z.string().min(3).optional(),
});

export { CreateMarketRequest, UpdateMarketRequest };
