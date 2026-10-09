import { Request, Response } from "express";
import catchAsync from "../../utility/catchAsync";
import { loadSheddingService } from "./load-shedding.service";
import { sendResponse } from "../../utility/sendResponse";
import httpStatus from "http-status";

const getLoadSheddingSchedule = catchAsync(
  async (req: Request, res: Response) => {
    const query = req.query;
    const allLoadSheddingSchedule =
      await loadSheddingService.getLoadSheddingSchedule(query);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Load shedding schedule retrieved successfully",
      data: allLoadSheddingSchedule,
    });
  },
);

const getLoadSheddingScheduleForManager = catchAsync(
  async (req: Request, res: Response) => {
    const allLoadSheddingSchedule =
      await loadSheddingService.getLoadSheddingScheduleForManager(
        req.user?.userId as string,
      );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Load shedding schedule for Manger retrieved successfully",
      data: allLoadSheddingSchedule,
    });
  },
);

const getFeedersForPowerOperators = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const allFeeders =
      await loadSheddingService.getAllFeedersForPowerOperators(userId);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Same Substations Feeders retrieved successfully",
      data: allFeeders,
    });
  },
);

const createLoadSheddingSchedule = catchAsync(
  async (req: Request, res: Response) => {
    const payload = req.body;
    const powerOperatorId = req.user?.userId as string;

    const newLoadSheddingSchedule =
      await loadSheddingService.createLoadSheddingSchedule(
        payload,
        powerOperatorId,
      );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message:
        "Load shedding schedule created successfully under Pending status",
      data: newLoadSheddingSchedule,
    });
  },
);

const approveSchedule = catchAsync(async (req: Request, res: Response) => {
  const id = req.params?.id as string;

  // console.log("get id params", id);
  const userId = req.user?.userId as string;

  const approvedSchedule = await loadSheddingService.approveSchedule(
    id,
    userId,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Load shedding schedule approved successfully",
    data: approvedSchedule,
  });
});

const rejectSchedule = catchAsync(async (req: Request, res: Response) => {
  const id = req.params?.id as string;

  const userId = req.user?.userId as string;

  const rejectedSchedule = await loadSheddingService.rejectSchedule(id, userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Load shedding schedule rejected successfully",
    data: rejectedSchedule,
  });
});

const publishSchedule = catchAsync(async (req: Request, res: Response) => {
  const id = req.params?.id as string;

  const userId = req.user?.userId as string;

  const publishedSchedule = await loadSheddingService.publishSchedule(
    id,
    userId,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Load shedding schedule published successfully",
    data: publishedSchedule,
  });
});

const updateLoadSheddingSchedule = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.params?.id as string;
    const payload = req.body;

    const updatedSchedule =
      await loadSheddingService.updateLoadSheddingSchedule(payload, id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Load shedding schedule updated successfully",
      data: updatedSchedule,
    });
  },
);

const deleteLoadSheddingSchedule = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.params?.id as string;

    await loadSheddingService.deleteLoadSheddingSchedule(id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Load shedding schedule deleted successfully",
      data: null,
    });
  },
);

export const loadSheddingController = {
  getLoadSheddingSchedule,
  getLoadSheddingScheduleForManager,
  getFeedersForPowerOperators,
  createLoadSheddingSchedule,
  approveSchedule,
  rejectSchedule,
  publishSchedule,
  updateLoadSheddingSchedule,
  deleteLoadSheddingSchedule,
};
