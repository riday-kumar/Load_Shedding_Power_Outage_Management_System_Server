import { LoadSheddingStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utility/AppError";
import httpStatus from "http-status";
import { ICreateLoadShedding } from "./load-shedding.interface";
import config from "../../config";
import ejs from "ejs";
import path from "path";
import { transporter } from "../../lib/nodemailer";
import { LoadSheddingScheduleWhereInput } from "../../../generated/prisma/models";

export interface IGetLoadSheddingSchedule extends LoadSheddingScheduleWhereInput {
  state?: LoadSheddingStatus;
  operator?: string;
}

const getLoadSheddingSchedule = async (query: IGetLoadSheddingSchedule) => {
  const andCondition: LoadSheddingScheduleWhereInput[] = [];

  if (query.state) {
    andCondition.push({
      OR: [
        {
          status: query.state,
        },
      ],
    });
  }

  if (query.operator) {
    andCondition.push({
      OR: [
        {
          powerOperator_id: query.operator,
        },
      ],
    });
  }

  const allLoadSheddingSchedule = await prisma.loadSheddingSchedule.findMany({
    where: {
      AND: andCondition,
    },
    include: {
      feeders: true,
      powerOperator: true,
    },
  });
  return allLoadSheddingSchedule;
};

const getAllFeedersForPowerOperators = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      powerOperators: true,
    },
  });

  const substationIdOfPowerOperator = user?.powerOperators?.substation_id;

  const feeders = await prisma.feeder.findMany({
    where: {
      substation_id: substationIdOfPowerOperator,
    },
  });
  return feeders;
};

const createLoadSheddingSchedule = async (
  payload: ICreateLoadShedding,
  powerOperator: string,
) => {
  const { feeder_id, start_time, end_time, reason, plannedLoadShedding } =
    payload;

  const today = new Date();

  // const isSameScheduleExists = await prisma.loadSheddingSchedule.findFirst({
  //   where: {
  //     OR: [
  //       {
  //         date: today,
  //         feeder_id,
  //         // start_time: {
  //         //   lt: end_time,
  //         // },
  //         // end_time: {
  //         //   gt: start_time,
  //         // },
  //         start_time,
  //         end_time,
  //       },
  //     ],
  //   },
  // });

  // if (isSameScheduleExists) {
  //   throw new AppError(httpStatus.CONFLICT, "Same schedule already exists");
  // }

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
      reason: reason ?? "No reason provided",
      plannedLoadShedding,
      powerOperator_id: isPowerOperatorExists.id,
    },
  });

  return newLoadSheddingSchedule;
};

const approveSchedule = async (id: string, userId: string) => {
  const isScheduleExists = await prisma.loadSheddingSchedule.findUnique({
    where: {
      id,
    },
    include: {
      feeders: {
        include: {
          manager: true,
        },
      },
    },
  });

  if (!isScheduleExists) {
    throw new AppError(httpStatus.NOT_FOUND, "Schedule not found");
  }

  if (isScheduleExists.status === LoadSheddingStatus.APPROVED) {
    throw new AppError(httpStatus.BAD_REQUEST, "Schedule already approved");
  }

  if (isScheduleExists.status !== LoadSheddingStatus.PENDING) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Schedule status must be pending",
    );
  }

  const getManager = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      distributorManager: true,
    },
  });

  if (!getManager) {
    throw new AppError(httpStatus.NOT_FOUND, "Manager not found");
  }

  if (
    getManager.distributorManager?.distributor_id !==
    isScheduleExists.feeders.manager.distributor_id
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Manager and feeder manager must be in the same distributor",
    );
  }

  if (
    getManager.distributorManager?.id !== isScheduleExists.feeders.manager.id
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Manager and feeder manager must be same",
    );
  }

  const approveSchedule = await prisma.loadSheddingSchedule.update({
    where: {
      id,
    },
    data: {
      status: LoadSheddingStatus.APPROVED,
      approvedById: getManager.distributorManager?.id,
    },
  });

  return approveSchedule;
};

const rejectSchedule = async (id: string, userId: string) => {
  const isScheduleExists = await prisma.loadSheddingSchedule.findUnique({
    where: {
      id,
    },
    include: {
      feeders: {
        include: {
          manager: true,
        },
      },
    },
  });

  if (!isScheduleExists) {
    throw new AppError(httpStatus.NOT_FOUND, "Schedule not found");
  }

  if (isScheduleExists.status === LoadSheddingStatus.REJECTED) {
    throw new AppError(httpStatus.BAD_REQUEST, "Schedule already rejected");
  }

  if (isScheduleExists.status !== LoadSheddingStatus.PENDING) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Schedule status must be pending",
    );
  }

  const getManager = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      distributorManager: true,
    },
  });

  if (!getManager) {
    throw new AppError(httpStatus.NOT_FOUND, "Manager not found");
  }

  if (
    getManager.distributorManager?.distributor_id !==
    isScheduleExists.feeders.manager.distributor_id
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Manager and feeder manager must be in the same distributor",
    );
  }

  if (
    getManager.distributorManager?.id !== isScheduleExists.feeders.manager.id
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Manager and feeder manager must be same",
    );
  }

  const rejectSchedule = await prisma.loadSheddingSchedule.update({
    where: {
      id,
    },
    data: {
      status: LoadSheddingStatus.REJECTED,
      approvedById: getManager.distributorManager?.id,
    },
  });

  return rejectSchedule;
};

const publishSchedule = async (id: string, userId: string) => {
  const formatBDDateTime = (value: Date | string) => {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Dhaka",
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(value));
  };

  const isScheduleExists = await prisma.loadSheddingSchedule.findUnique({
    where: {
      id,
    },
    include: {
      feeders: {
        include: {
          manager: true,
        },
      },
    },
  });

  if (!isScheduleExists) {
    throw new AppError(httpStatus.NOT_FOUND, "Schedule not found");
  }

  if (isScheduleExists.status !== LoadSheddingStatus.APPROVED) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Schedule status must be approved",
    );
  }

  // console.log("feaders area", isScheduleExists.feeders.area);

  const powerOperator = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      powerOperators: true,
    },
  });

  if (!powerOperator) {
    throw new AppError(httpStatus.NOT_FOUND, "Power operator not found");
  }

  if (powerOperator.powerOperators?.id !== isScheduleExists.powerOperator_id) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "schedule creator power operator and power operator must be same",
    );
  }

  const publishSchedule = await prisma.loadSheddingSchedule.update({
    where: {
      id,
    },
    data: {
      status: LoadSheddingStatus.PUBLISHED,
    },
  });

  const loadSheddingFeeder = isScheduleExists.feeder_id;

  // now we have to send otp Email to the USER
  const templatePath = path.join(
    process.cwd(),
    "src/app/templates/new-load-shedding.ejs",
  );

  const emailData = {
    date: publishSchedule.date.toDateString(),
    start_time: formatBDDateTime(publishSchedule.start_time),
    end_time: formatBDDateTime(publishSchedule.end_time),
  };

  const html = await ejs.renderFile(templatePath, emailData);

  const users = await prisma.user.findMany({
    where: {
      feederId: loadSheddingFeeder,
    },
  });

  const recipients = users.map((user) => user.email);

  const mailOptions = {
    from: config.email_sender,
    to: recipients,
    subject: "Load shedding Schedule",
    html,
  };

  transporter.sendMail(mailOptions);

  return publishSchedule;
};

const updateLoadSheddingSchedule = async (
  payload: ICreateLoadShedding,
  id: string,
) => {
  const isScheduleExists = await prisma.loadSheddingSchedule.findUnique({
    where: {
      id,
    },
    include: {
      feeders: {
        include: {
          manager: true,
        },
      },
    },
  });

  if (!isScheduleExists) {
    throw new AppError(httpStatus.NOT_FOUND, "Schedule not found");
  }

  if (
    isScheduleExists.status === LoadSheddingStatus.PUBLISHED ||
    isScheduleExists.status === LoadSheddingStatus.APPROVED
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "published or approved schedule cannot be updated",
    );
  }

  const updateSchedule = await prisma.loadSheddingSchedule.update({
    where: {
      id,
    },
    data: {
      ...payload,
    },
  });

  return updateSchedule;
};

const deleteLoadSheddingSchedule = async (id: string) => {
  const isScheduleExists = await prisma.loadSheddingSchedule.findUnique({
    where: {
      id,
    },
    include: {
      feeders: {
        include: {
          manager: true,
        },
      },
    },
  });

  if (!isScheduleExists) {
    throw new AppError(httpStatus.NOT_FOUND, "Schedule not found");
  }

  if (
    isScheduleExists.status === LoadSheddingStatus.PUBLISHED ||
    isScheduleExists.status === LoadSheddingStatus.APPROVED
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "published or approved schedule cannot be deleted",
    );
  }

  await prisma.loadSheddingSchedule.delete({
    where: {
      id,
    },
  });
};

export const loadSheddingService = {
  getLoadSheddingSchedule,
  getAllFeedersForPowerOperators,
  createLoadSheddingSchedule,
  approveSchedule,
  rejectSchedule,
  publishSchedule,
  updateLoadSheddingSchedule,
  deleteLoadSheddingSchedule,
};
