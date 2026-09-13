import { ComplaintStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utility/AppError";
import httpStatus from "http-status";

interface ICreateComplaint {
  complaintMessage: string;
  feeder_id: string;
}

const createComplaint = async (payload: ICreateComplaint, userId: string) => {
  const { complaintMessage, feeder_id } = payload;

  const isUserExists = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!isUserExists) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const now = new Date();

  const isSubscribedUser = await prisma.subscription.findFirst({
    where: {
      userId: isUserExists.id,
      expiresAt: {
        gte: now,
      },
    },
  });

  if (!isSubscribedUser) {
    throw new AppError(httpStatus.BAD_REQUEST, "User not subscribed");
  }

  const complaint = await prisma.complaint.create({
    data: {
      complaintMessage,
      feeder_id,
      userId: isUserExists.id,
    },
  });

  return complaint;
};

const getComplaintsToPowerOperator = async (userId: string) => {
  const powerOperator = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      powerOperators: true,
    },
  });

  const getSubstationFeeders = await prisma.complaint.findMany({
    where: {
      feeders: {
        substation_id: powerOperator?.powerOperators?.substation_id,
      },
    },
  });

  return getSubstationFeeders;
};

const approvedComplaint = async (complaintId: string) => {
  const complaint = await prisma.complaint.findUnique({
    where: {
      id: complaintId,
    },
  });

  if (!complaint) {
    throw new AppError(httpStatus.NOT_FOUND, "Complaint not found");
  }

  const approvedComplaint = await prisma.complaint.update({
    where: {
      id: complaintId,
    },
    data: {
      status: ComplaintStatus.APPROVED,
    },
  });

  return approvedComplaint;
};

export const complaintService = {
  createComplaint,
  getComplaintsToPowerOperator,
  approvedComplaint,
};
