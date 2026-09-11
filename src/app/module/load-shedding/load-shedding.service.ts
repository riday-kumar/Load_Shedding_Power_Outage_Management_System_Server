import { prisma } from "../../lib/prisma";
import { AppError } from "../../utility/AppError";
import httpStatus from "http-status";

interface ICreateLoadShedding {
  feeder_id: string;
  start_time: string;
  end_time: string;
  reason?: string;
  plannedLoadShedding: number;
}

const createLoadSheddingSchedule = async (
  payload: ICreateLoadShedding,
  powerOperator: string,
) => {
  const { feeder_id, start_time, end_time, reason, plannedLoadShedding } =
    payload;

  const today = new Date();

  const isSameScheduleExists = await prisma.loadSheddingSchedule.findFirst({
    where: {
      date: today,
      feeder_id,
      start_time,
      end_time,
    },
  });

  if (isSameScheduleExists) {
    throw new AppError(httpStatus.CONFLICT, "Same schedule already exists");
  }

  const getPowerOperator = await prisma.user.findUnique({
    where: {
      id: powerOperator,
    },
    include: {
      powerOperators: true,
    },
  });

  const isPowerOperatorExists = await prisma.powerOperator.findUnique({
    where: {
      id: getPowerOperator?.powerOperators?.id,
    },
  });

  if (!isPowerOperatorExists) {
    throw new AppError(httpStatus.NOT_FOUND, "Power operator not found");
  }

  const isFeederExists = await prisma.feeder.findUnique({
    where: {
      id: feeder_id,
    },
  });

  if (!isFeederExists) {
    throw new AppError(httpStatus.NOT_FOUND, "Feeder not found");
  }

  if (isFeederExists.substation_id !== isPowerOperatorExists.substation_id) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Feeder and power operator must be in the same substation",
    );
  }

  const newLoadSheddingSchedule = await prisma.loadSheddingSchedule.create({
    data: {
      feeder_id,
      date: today,
      start_time,
      end_time,
      reason: reason || "No reason provided",
      plannedLoadShedding,
      powerOperator_id: isPowerOperatorExists.id,
    },
  });

  return newLoadSheddingSchedule;
};

export const loadSheddingService = {
  createLoadSheddingSchedule,
};
