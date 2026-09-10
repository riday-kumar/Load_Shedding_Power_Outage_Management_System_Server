import { z } from "zod";

const createSubstationSchema = z.object({
  station_name: z.string().min(1, "Substation name is required"),
  distributor_id: z.string().min(1, "Distributor id is required"),
});

export const CreatePowerOperatorSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters long")
    .max(100, "Name must not exceed 100 characters"),

  email: z.string().email("Invalid email address"),

  address: z
    .string()
    .min(5, "Address must be at least 5 characters long")
    .max(255, "Address must not exceed 255 characters"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must not exceed 100 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),

  substation_id: z.string().min(1, "Substation ID is required"),
});

export const distributorManagerValidation = {
  createSubstationSchema,
  CreatePowerOperatorSchema,
};
