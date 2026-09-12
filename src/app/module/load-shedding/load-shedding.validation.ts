import { z } from "zod";

const createLoadSheddingSchema = z.object({
  feeder_id: z.string().min(1, "Feeder ID is required"),
  start_time: z.coerce.date(),
  end_time: z.coerce.date(),
  reason: z.string().optional(),
  plannedLoadShedding: z
    .number()
    .min(0, "Planned load shedding must be greater than or equal to 0"),
});

export const LoadSheddingValidationSchema = {
  createLoadSheddingSchema,
};
