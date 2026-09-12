import {
  EmergencyOutageStatus,
  TechnicianStatus,
} from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utility/AppError";
import httpStatus from "http-status";

interface ICreateEmergencyOutagePayload {
  feeder_id: string;
  reporter_id: string;
  reason?: string;
  startedAt?: string;
}

const createEmergencyOutage = async (
  payload: ICreateEmergencyOutagePayload,
  userId: string,
) => {
  const { feeder_id, reason, startedAt } = payload;

  const isFeederExists = await prisma.feeder.findUnique({
    where: {
      id: feeder_id,
    },
  });

  if (!isFeederExists) {
    throw new AppError(httpStatus.BAD_REQUEST, "Feeder does not exist");
  }

  const emergencyOutage = await prisma.emergencyOutage.create({
    data: {
      feeder_id,
      reporter_id: userId,
      reason: reason ?? "",
      startedAt,
    },
  });
  return emergencyOutage;
};

// get about emergency outage to the power operator (under same substation)
const getEmergencyOutage = async (userId: string) => {
  const getPowerOperatorSubstation = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      powerOperators: true,
    },
  });

  if (!getPowerOperatorSubstation) {
    throw new AppError(httpStatus.BAD_REQUEST, "Power operator does not exist");
  }

  const powerOperatorSubstationId =
    getPowerOperatorSubstation?.powerOperators?.substation_id;

  const getAllEmergencyOutage = await prisma.emergencyOutage.findMany({
    where: {
      feeders: {
        substation_id: powerOperatorSubstationId,
      },
    },
    include: {
      feeders: true,
    },
  });

  return getAllEmergencyOutage;
};

const verifyEmergencyOutage = async (id: string) => {
  const emergencyOutage = await prisma.emergencyOutage.findUnique({
    where: {
      id,
    },
  });

  if (!emergencyOutage) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Emergency outage does not exist",
    );
  }

  if (emergencyOutage.status === EmergencyOutageStatus.Verified) {
    throw new AppError(
      httpStatus.CONFLICT,
      "Emergency outage is already verified",
    );
  }

  await prisma.emergencyOutage.update({
    where: {
      id,
    },
    data: {
      status: EmergencyOutageStatus.Verified,
    },
  });
};

const getAvailableTechnician = async (userId: string) => {
  const powerOperator = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      powerOperators: true,
    },
  });

  if (!powerOperator) {
    throw new AppError(httpStatus.BAD_REQUEST, "Power operator does not exist");
  }

  const getSubstationId = powerOperator.powerOperators?.substation_id;

  const availableTechnician = await prisma.technician.findMany({
    where: {
      substationId: getSubstationId,
      status: TechnicianStatus.AVAILABLE,
    },
    include: {
      users: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          address: true,
        },
      },
    },
  });
  return availableTechnician;
};

const assignTechnician = async (
  emergencyOutageId: string,
  technicianId: string,
) => {
  const hasTechnician = await prisma.technician.findUnique({
    where: {
      id: technicianId,
    },
  });

  if (!hasTechnician) {
    throw new AppError(httpStatus.BAD_REQUEST, "Technician does not exist");
  }

  const isEmergencyOutageExist = await prisma.emergencyOutage.findUnique({
    where: {
      id: emergencyOutageId,
    },
  });

  if (!isEmergencyOutageExist) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Emergency outage does not exist",
    );
  }

  if (isEmergencyOutageExist.status !== EmergencyOutageStatus.Verified) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Emergency outage is not verified",
    );
  }

  await prisma.emergencyOutage.update({
    where: {
      id: emergencyOutageId,
    },
    data: {
      status: EmergencyOutageStatus.TECHNICIAN_ASSIGNED,
    },
  });

  await prisma.technician.update({
    where: {
      id: technicianId,
    },
    data: {
      status: TechnicianStatus.ENGAGED,
    },
  });
};

const changeStatusToUnderRepair = async (emergencyOutageId: string) => {
  const isEmergencyOutageExist = await prisma.emergencyOutage.findUnique({
    where: {
      id: emergencyOutageId,
    },
  });

  if (!isEmergencyOutageExist) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Emergency outage does not exist",
    );
  }

  if (
    isEmergencyOutageExist.status !== EmergencyOutageStatus.TECHNICIAN_ASSIGNED
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Emergency outage technician is not assigned",
    );
  }

  await prisma.emergencyOutage.update({
    where: {
      id: emergencyOutageId,
    },
    data: {
      status: EmergencyOutageStatus.UNDER_REPAIR,
    },
  });
};

const changeStatusToResolved = async (
  emergencyOutageId: string,
  technicianId: string,
) => {
  const isEmergencyOutageExist = await prisma.emergencyOutage.findUnique({
    where: {
      id: emergencyOutageId,
    },
  });

  if (!isEmergencyOutageExist) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Emergency outage does not exist",
    );
  }

  if (
    isEmergencyOutageExist.status !== EmergencyOutageStatus.TECHNICIAN_ASSIGNED
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Emergency outage technician is not assigned",
    );
  }

  await prisma.emergencyOutage.update({
    where: {
      id: emergencyOutageId,
    },
    data: {
      status: EmergencyOutageStatus.RESOLVED,
    },
  });

  await prisma.technician.update({
    where: {
      id: technicianId,
    },
    data: {
      status: TechnicianStatus.AVAILABLE,
    },
  });
};

export const emergencyOutageService = {
  createEmergencyOutage,
  getEmergencyOutage,
  verifyEmergencyOutage,
  getAvailableTechnician,
  assignTechnician,
  changeStatusToUnderRepair,
  changeStatusToResolved,
};
