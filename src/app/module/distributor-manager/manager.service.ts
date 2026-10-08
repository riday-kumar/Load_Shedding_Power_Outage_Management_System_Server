import { Role } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utility/AppError";
import httpStatus from "http-status";
import bcrypt from "bcrypt";
import config from "../../config";
import {
  createPowerOperatorPayload,
  createSubstationPayload,
  createTechnicianPayload,
  ICreateFeederPayload,
  ISubstationPowerDistribution,
  IUpdateFeederPayload,
  updateSubstationPayload,
} from "./manager.interface";
import { FeederWhereInput } from "../../../generated/prisma/models";

const getSubstationForManager = async (userId: string) => {
  const allSubstationOfManager = await prisma.substation.findMany({
    where: {
      createdById: userId,
    },
    include: {
      distributor: {
        select: {
          company_name: true,
        },
      },
    },
  });

  return allSubstationOfManager;
};

const createSubstation = async (
  payload: createSubstationPayload,
  userId: string,
) => {
  const { station_name } = payload;

  const managerExistingCompany = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      distributorManager: {
        select: {
          distributor_id: true,
        },
      },
    },
  });

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
      distributor_id: managerExistingCompany?.distributorManager
        ?.distributor_id as string,
      createdById: userId,
    },
  });
  return subStation;
};

const updateSubstation = async (
  substationId: string,
  payload: updateSubstationPayload,
  userId: string,
) => {
  const isSubstationExists = await prisma.substation.findUnique({
    where: {
      id: substationId,
      distributor_id: payload.distributor_id,
    },
  });

  if (!isSubstationExists) {
    throw new AppError(httpStatus.NOT_FOUND, "Substation Not Found");
  }

  if (isSubstationExists.createdById !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not eligible to edit this substation",
    );
  }

  const updateStation = await prisma.substation.update({
    where: {
      id: isSubstationExists.id,
    },
    data: {
      station_name: payload.station_name,
    },
  });

  return updateStation;
};

const getPowerOperatorsForManager = async (userId: string) => {
  const powerOperators = await prisma.powerOperator.findMany({
    where: {
      createdById: userId,
    },
    include: {
      substation: true,
      user: {
        select: {
          name: true,
          email: true,
          phone: true,
          address: true,
        },
      },
    },
  });

  return powerOperators;
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

const powerAllocateIntoSubstation = async (
  payload: ISubstationPowerDistribution[],
  distributor_company_id: string,
  userId: string,
) => {
  const today = new Date();

  const todaysAllocatedPower = await prisma.powerDistribution.findFirst({
    where: {
      distributor_id: distributor_company_id,
      allocatedAt: today,
    },
  });

  if (!todaysAllocatedPower) {
    throw new AppError(httpStatus.CONFLICT, "Power not allocated for today");
  }

  const isSubstationPowerAllocated =
    await prisma.substationPowerAllocation.findFirst({
      where: {
        allocationAt: today,
      },
    });

  if (isSubstationPowerAllocated) {
    throw new AppError(
      httpStatus.CONFLICT,
      "Power already allocated to the sub stations for today",
    );
  }

  if (!distributor_company_id) {
    throw new AppError(httpStatus.NOT_FOUND, "Distributor Company not found!");
  }

  const isDistributorCompanyExists = await prisma.distributor.findUnique({
    where: {
      id: distributor_company_id,
    },
  });

  if (!isDistributorCompanyExists) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Distributor Company doesn't exists",
    );
  }

  const aboutManager = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      distributorManager: true,
    },
  });

  // see total substations
  const totalSubstations = await prisma.substation.count({
    where: {
      distributor_id: aboutManager?.distributorManager?.distributor_id,
    },
  });

  if (payload.length !== totalSubstations) {
    throw new AppError(httpStatus.CONFLICT, "sub stations number not matched!");
  }

  const totalGivenByPowerAuth = Number(todaysAllocatedPower.allocated);
  const totalAllocatedByManager = payload.reduce(
    (acc, cur) => acc + cur.allocatedNeed,
    0,
  );

  if (totalAllocatedByManager > totalGivenByPowerAuth) {
    throw new AppError(
      httpStatus.CONFLICT,
      "Power distribution not match with allocated power",
    );
  }

  const seenSubstationIds = new Set<string>();
  const duplicateSubstationIds = payload.filter((data) => {
    if (seenSubstationIds.has(data.substation_id)) {
      return true;
    }
    seenSubstationIds.add(data.substation_id);
    return false;
  });

  if (duplicateSubstationIds.length > 0) {
    throw new AppError(httpStatus.CONFLICT, "Duplicate substation ids");
  }

  const singleData = payload.map((data) => ({
    substation_id: data.substation_id,
    allocationAt: today,

    expectedNeed: data.expectedNeed,
    allocatedNeed: data.allocatedNeed,

    createdById: userId,
  }));

  const powerDistributeToSubstation =
    await prisma.substationPowerAllocation.createMany({
      data: singleData,
    });

  return powerDistributeToSubstation;
};

export interface IAllFeeder extends FeederWhereInput {
  area?: string;
  creator?: string;
  page?: string;
  limit?: string;
}

const allFeeder = async (query: IAllFeeder) => {
  // console.log(payload);
  const limit = query.limit ? Number(query.limit) : 5;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;

  const andCondition: FeederWhereInput[] = [];

  if (query.area) {
    andCondition.push({
      OR: [
        {
          area: {
            contains: query.area,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  if (query.creator) {
    andCondition.push({
      createdBy: query.creator,
    });
  }

  const feeders = await prisma.feeder.findMany({
    where: {
      // area: {
      //   contains: area || "",
      //   mode: "insensitive",
      // },
      // createdBy: {
      //   contains: userId || "",
      // },
      AND: andCondition,
    },
    include: {
      substation: {
        select: {
          station_name: true,
        },
      },
    },
    take: limit,
    skip: skip,
  });

  const totalFeedersCount = await prisma.feeder.count({
    where: {
      AND: andCondition,
    },
  });

  return {
    data: feeders,
    meta: {
      page: page,
      limit: limit,
      total: totalFeedersCount,
      totalPage: Math.ceil(totalFeedersCount / limit),
    },
  };
};

const createFeeder = async (payload: ICreateFeederPayload, userId: string) => {
  const { feeder_name, division, district, area, substation_id } = payload;
  console.log(payload);
  const manager = await prisma.distributorManager.findUnique({
    where: {
      user_id: userId,
    },
  });

  if (!manager) {
    throw new AppError(httpStatus.NOT_FOUND, "Distributor manager not found");
  }

  const isSubStationExists = await prisma.substation.findUnique({
    where: {
      id: substation_id,
    },
  });

  if (!isSubStationExists) {
    throw new AppError(httpStatus.NOT_FOUND, "Substation not found");
  }

  const isFeederExists = await prisma.feeder.findFirst({
    where: {
      feeder_name,
      substation_id,
    },
  });

  if (isFeederExists) {
    throw new AppError(httpStatus.CONFLICT, "Feeder already exist");
  }

  const newFeeder = await prisma.feeder.create({
    data: {
      feeder_name,
      division,
      district,
      area,
      substation_id,
      createdBy: manager?.id,
    },
    include: {
      substation: true,
    },
  });
  return newFeeder;
};

const updateFeeder = async (payload: IUpdateFeederPayload, userId: string) => {
  const { id, feeder_name, division, district, area, substation_id } = payload;

  const manager = await prisma.distributorManager.findUnique({
    where: {
      user_id: userId,
    },
  });

  if (!manager) {
    throw new AppError(httpStatus.NOT_FOUND, "Distributor manager not found");
  }

  const isFeederExists = await prisma.feeder.findUnique({
    where: {
      id,
    },
  });

  if (!isFeederExists) {
    throw new AppError(httpStatus.NOT_FOUND, "Feeder not found");
  }

  if (isFeederExists.createdBy !== manager?.id) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to update this feeder",
    );
  }

  const updateFeeder = await prisma.feeder.update({
    where: {
      id,
    },
    data: {
      feeder_name,
      division,
      district,
      area,
      substation_id,
    },
  });
  return updateFeeder;
};

const getTechnicians = async (managerId: string, substationId: string) => {
  const technicians = await prisma.technician.findMany({
    where: {
      createdBy: {
        contains: managerId,
        mode: "insensitive",
      },
      substationId: {
        contains: substationId,
        mode: "insensitive",
      },
    },
    include: {
      users: {
        select: {
          name: true,
          email: true,
          phone: true,
        },
      },
      substation: {
        select: {
          station_name: true,
        },
      },
    },
  });
  return technicians;
};

const createTechnician = async (
  payload: createTechnicianPayload,
  userId: string,
) => {
  const { name, email, address, password, skill, substationId } = payload;

  const isTechnicianExists = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (isTechnicianExists) {
    throw new AppError(httpStatus.CONFLICT, "Technician already exist");
  }

  const manager = await prisma.distributorManager.findUnique({
    where: {
      user_id: userId,
    },
  });

  if (!manager) {
    throw new AppError(httpStatus.NOT_FOUND, "Distributor manager not found");
  }

  const hashedPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_round),
  );

  const newTechnician = await prisma.user.create({
    data: {
      name,
      email,
      address,
      role: Role.TECHNICIAN,
      emailVerified: true,
      password: hashedPassword,
      technicians: {
        create: {
          skill,
          createdBy: manager.id,
          substationId,
        },
      },
    },
  });

  return newTechnician;
};

export const distributorManagerService = {
  getSubstationForManager,
  createSubstation,
  updateSubstation,
  getPowerOperatorsForManager,
  createPowerOperator,
  powerAllocateIntoSubstation,
  allFeeder,
  createFeeder,
  updateFeeder,
  getTechnicians,
  createTechnician,
};
