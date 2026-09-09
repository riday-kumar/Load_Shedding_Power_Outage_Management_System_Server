import { z } from "zod";

const CreateNationalLevelElectricitySchema = z.object({
  generatedPowerMW: z
    .number()
    .positive("Generated power must be greater than 0"),
  demand: z.number().positive("Demand power must be greater than 0"),
});

export const powerAuthValidation = { CreateNationalLevelElectricitySchema };
