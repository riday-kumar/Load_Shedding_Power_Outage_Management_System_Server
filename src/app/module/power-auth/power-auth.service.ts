import { prisma } from "../../lib/prisma";

interface INationalLevelElectricity {
  generatedPowerMW: number;
  demand: number;
}

const nationalLevelElectricity = async (
  payload: INationalLevelElectricity,
  userId: string,
) => {
  const { generatedPowerMW, demand } = payload;
  const result = await prisma.nationalPowerStatus.create({
    data: {
      date: new Date(),
      generatedPowerMW,
      demand,
      createdById: userId,
    },
  });
  return result;
};

export const powerAuthServices = {
  nationalLevelElectricity,
};
