import { Role } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utility/AppError";
import httpStatus from "http-status";
import bcrypt from "bcrypt";
import config from "../../config";

interface createSubstationPayload {
  station_name: string;
  distributor_id: string;
}

interface createPowerOperatorPayload {
  name: string;
  email: string;
  address: string;
  password: string;
  substation_id: string;
}

const createSubstation = async (
  payload: createSubstationPayload,
  userId: string,
) => {
  const { station_name, distributor_id } = payload;

  const isUnderSameDistributorCompany = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      distributorManager: true,
    },
  });

  if (
    isUnderSameDistributorCompany?.distributorManager?.distributor_id !==
    distributor_id
  ) {
    throw new AppError(
      httpStatus.CONFLICT,
      "Manager not found on same distributor company",
    );
  }

  const isSubStationExist = await prisma.substation.findFirst({
    where: {
      station_name,
      createdById: userId,
    },
  });

  if (isSubStationExist) {
    throw new AppError(httpStatus.CONFLICT, "Substation already exist");
  }

  const subStation = await prisma.substation.create({
    data: {
      station_name,
      distributor_id,
      createdById: userId,
    },
  });
  return subStation;
};

const createPowerOperator = async (
  payload: createPowerOperatorPayload,
  userId: string,
) => {
  const { name, email, address, password, substation_id } = payload;

  const isPowerOperatorExist = await prisma.user.findUnique({
    where: {
      email,
      role: Role.POWER_OPERATOR,
    },
    include: {
      powerOperators: true,
    },
  });

  if (isPowerOperatorExist) {
    throw new AppError(httpStatus.CONFLICT, "Power operator already exist");
  }

  const isSubStationExist = await prisma.substation.findUnique({
    where: {
      id: substation_id,
    },
    include: {
      createdBy: true,
    },
  });
  if (!isSubStationExist) {
    throw new AppError(httpStatus.CONFLICT, "Substation not found");
  }

  if (isSubStationExist.createdById !== userId) {
    throw new AppError(
      httpStatus.CONFLICT,
      "substation owner and user not match",
    );
  }

  const hashedPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_round),
  );

  const newPowerOperator = await prisma.user.create({
    data: {
      name,
      email,
      address,
      password: hashedPassword,
      role: Role.POWER_OPERATOR,
      emailVerified: true,
      powerOperators: {
        create: {
          createdById: userId,
          substation_id,
        },
      },
    },
    omit: {
      password: true,
    },
  });

  return newPowerOperator;
};

export const distributorManagerService = {
  createSubstation,
  createPowerOperator,
};
