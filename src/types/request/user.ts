import { z } from "zod";

// const CreateUserRequest = z.object({
//   id: z.string(),
//   full_name: z.string().min(3).nullable(),
//   username: z.string().min(3),
//   email: z.string().email(),
//   password: z.string().min(3).nullable(),
//   phone: z.string().min(10).nullable(),
//   role: z.enum(["USER", "ADMIN", "MERCHANT"]).default("USER"),
//   provider: z.enum(["GOOGLE", "EMAIL"]),
//   longitude: z.string().nullable(),
//   latitude: z.string().nullable(),
//   address: z.string().nullable(),
// });

const CreateUserRequest = z.object({
  id: z.string(),
  full_name: z.string().min(3, "Fullname harus memiliki minimal 3 karakter."),
  username: z.string().min(3, "Username harus memiliki minimal 3 karakter."),
  email: z.string().email("Format email tidak valid."),
  password: z.string().min(3, "Password harus memiliki minimal 3 karakter."),
});

const UpdateUserRequest = z.object({
  full_name: z.string().min(3).optional(),
  username: z.string().min(3).optional(),
  email: z.string().email().optional(),
  password: z.string().optional(),
  role: z.enum(["USER", "ADMIN", "MERCHANT"]).optional(),
});

export { CreateUserRequest, UpdateUserRequest };
