import { z } from "zod";

const CreateImageRequest = z.object({
  // url: z.string().optional(),
  // type: z.string(),
});

const UpdateImageRequest = z.object({
  // url: z.string().optional(),
  // type: z.string().optional(),
});

export { CreateImageRequest, UpdateImageRequest };
