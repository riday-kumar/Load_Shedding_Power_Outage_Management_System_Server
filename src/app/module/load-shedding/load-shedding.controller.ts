import { Request, Response } from "express";
import catchAsync from "../../utility/catchAsync";
import { loadSheddingService } from "./load-shedding.service";
import { sendResponse } from "../../utility/sendResponse";
import httpStatus from "http-status";

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

export const loadSheddingController = {
  createLoadSheddingSchedule,
  approveSchedule,
  rejectSchedule,
  publishSchedule,
};
