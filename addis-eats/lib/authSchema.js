import { z } from "zod";
import { phoneSchema } from "./orderSchema";

export const signInSchema = z.object({
  phone: phoneSchema,
  password: z.string().min(1, "Password is required")
});

export const signUpSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  phone: phoneSchema,
  password: z.string().min(8, "Password must be at least 8 characters").max(128, "Password is too long")
});
