import { z } from "zod";

const CreateNationalLevelElectricitySchema = z.object({
  generatedPowerMW: z
    .number()
    .positive("Generated power must be greater than 0"),
  demand: z.number().positive("Demand power must be greater than 0"),
});

export const createPowerDistributionSchema = z.array(
  z.object({
    expected_need: z.number().positive(),
    allocated: z.number().positive(),
    distributor_id: z.string().min(1),
  }),
);

export const powerAuthValidation = {
  CreateNationalLevelElectricitySchema,
  createPowerDistributionSchema,
};
