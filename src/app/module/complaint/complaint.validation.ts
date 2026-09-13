import { z } from "zod";

const CreateComplaintSchema = z.object({
  complaintMessage: z.string().min(1, "Complaint message is required"),
  feeder_id: z.string().min(1, "Feeder ID is required"),
});

export const complaintValidation = { CreateComplaintSchema };
