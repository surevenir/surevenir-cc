import { z } from "zod";

const CreateMarketRequest = z.object({
  id: z.string(),
  name: z.string().min(3),
  dascription: z.string().min(3),
  longitude: z.string().min(3),
  latitude: z.string().min(3),
});

const UpdateMarketRequest = z.object({
  name: z.string().min(3).optional(),
  dascription: z.string().min(3).optional(),
  longitude: z.string().min(3).optional(),
  latitude: z.string().min(3).optional(),
});

export { CreateMarketRequest, UpdateMarketRequest };
