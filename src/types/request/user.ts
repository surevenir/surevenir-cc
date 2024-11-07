import { z } from "zod";

const CreateUserRequest = z.object({
  full_name: z.string().min(3),
  username: z.string().min(3),
  email: z.string().email(),
  provider: z.enum(["GOOGLE", "LOCAL"]),
  password: z.string().optional(), 
  role: z.enum(["USER", "ADMIN", "MERCHANT"]),
});

export { CreateUserRequest };