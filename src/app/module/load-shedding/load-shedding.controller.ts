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
      message: "Load shedding schedule created successfully under Draft status",
      data: newLoadSheddingSchedule,
    });
  },
);

export const loadSheddingController = {
  createLoadSheddingSchedule,
};
