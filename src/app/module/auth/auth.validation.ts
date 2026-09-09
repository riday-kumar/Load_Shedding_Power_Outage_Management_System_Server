import { z } from "zod";

const RegisterUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters"),

  email: z
    .string()
    .trim()
    .email("Please provide a valid email address")
    .toLowerCase(),

  phone: z
    .string()
    .trim()
    .regex(/^01[3-9]\d{8}$/, "Please provide a valid Bangladeshi phone number")
    .optional(),

  address: z
    .string()
    .trim()
    .min(5, "Address must be at least 5 characters")
    .max(300, "Address must not exceed 300 characters"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must not exceed 100 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

const EmailVerifyZodSchema = z.object({
  email: z.email("Not email!!"),
  otp: z.string().length(6, "OTP must be 6 characters long"),
});

export const authValidation = {
  RegisterUserSchema,
  EmailVerifyZodSchema,
};
