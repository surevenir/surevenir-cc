import { z } from "zod";

const CreateUserRequest = z.object({
  fullname: z.string().min(3),
  username: z.string().min(3),
  email: z.string().email(),
  provider: z.enum(["GOOGLE", "EMAIL"]),
  password: z.string().optional(),
  role: z.enum(["USER", "ADMIN", "MERCHANT"]),
});

export { CreateUserRequest };
