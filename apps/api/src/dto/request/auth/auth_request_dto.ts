import { z } from "zod";

const emailSchema = z.string().email().max(255).toLowerCase();
const passwordSchema = z.string().min(8, "password must be at least 8 characters");

export const SignupRequestSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const LoginRequestSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export type SignupRequestDTO = z.infer<typeof SignupRequestSchema>;
export type LoginRequestDTO = z.infer<typeof LoginRequestSchema>;
