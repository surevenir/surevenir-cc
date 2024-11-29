import { z } from "zod";

const CreateUserRequest = z.object({
  id: z.string(),
  full_name: z.string().min(3),
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().optional(),
  role: z.enum(["USER", "ADMIN", "MERCHANT"]).optional().default("USER"),
});

const UpdateUserRequest = z.object({
  full_name: z.string().min(3).optional(),
  username: z.string().min(3).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(10).optional(),
  password: z.string().optional(),
  role: z.enum(["USER", "ADMIN", "MERCHANT"]).optional(),
  longitude: z.string().nullable().optional(),
  latitude: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
});

export { CreateUserRequest, UpdateUserRequest };
