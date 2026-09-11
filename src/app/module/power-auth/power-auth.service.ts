import { isToday } from "date-fns";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utility/AppError";
import httpStatus from "http-status";

interface INationalLevelElectricity {
  date: string;
  generatedPowerMW: number;
  demand: number;
}

interface ICreatePowerDistribution {
  expected_need: number;
  allocated: number;
  distributor_id: string;
}

const nationalLevelElectricity = async (
  payload: INationalLevelElectricity,
  userId: string,
) => {
  const { generatedPowerMW, demand } = payload;

  const today = new Date();

  // check today's power status already exists or not
  const isTodaysPowerExists = await prisma.nationalPowerStatus.findFirst({
    where: {
      date: today,
    },
  });

  if (isTodaysPowerExists) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Power status already exists for today",
    );
  }

  const result = await prisma.nationalPowerStatus.create({
    data: {
      date: today,
      generatedPowerMW,
      demand,
      createdById: userId,
    },
  });

  return result;
};

const powerDistribution = async (payload: ICreatePowerDistribution[]) => {
  // console.log("payload", payload);

  const today = new Date();

  const result = await prisma.$transaction(async (tx) => {
    // check if today has available power
    const todaysAvailablePower = await prisma.nationalPowerStatus.findFirst({
      where: {
        date: today,
      },
    });

    // console.log("today power status", todaysAvailablePower);
    if (!todaysAvailablePower) {
      throw new AppError(httpStatus.NOT_FOUND, "No available power today");
    }

    // check power is already distributed or not
    const isAlreadyDistributed = await tx.powerDistribution.findFirst({
      where: {
        allocatedAt: today,
      },
    });

    if (isAlreadyDistributed) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Power already distributed for today",
      );
    }

    // check if all power distributor company are allocated in the payload
    const totalPowerDistributorCompany = await tx.distributor.count();

    if (payload.length !== totalPowerDistributorCompany) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "All power distributor company must be allocated",
      );
    }

    // take single data from payload
    const singleData = payload.map((item) => ({
      allocatedAt: today,
      expected_need: item.expected_need,
      allocated: item.allocated,
      distributor_id: item.distributor_id,
    }));

    // total allocated power count
    const totalAllocatedPower = payload.reduce(
      (acc, cur) => acc + cur.allocated,
      0,
    );

    // check if total allocated power cannot exceed generated power
    if (
      Number(totalAllocatedPower) >
      Number(todaysAvailablePower.generatedPowerMW)
    ) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Total allocated power cannot exceed generated power",
      );
    }

    // create power distribution
    const powerSupply = await tx.powerDistribution.createMany({
      data: singleData,
    });

    return powerSupply;
  });

  return result;
};

export const powerAuthServices = {
  nationalLevelElectricity,
  powerDistribution,
};
