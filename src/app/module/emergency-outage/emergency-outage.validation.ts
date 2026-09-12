import { z } from "zod";

const CreateEmergencyOutageSchema = z.object({
  feeder_id: z.string().min(1, "Feeder ID is required"),

  reason: z.string().optional(),

  startedAt: z.string().min(1, "Start date is required"),
});

export const emergencyOutageValidation = {
  CreateEmergencyOutageSchema,
};
