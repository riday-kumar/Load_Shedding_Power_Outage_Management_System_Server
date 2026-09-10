import { Request, Response } from "express";
import catchAsync from "../../utility/catchAsync";
import { sendResponse } from "../../utility/sendResponse";
import { distributorManagerService } from "./manager.service";
import httpStatus from "http-status";

const createSubstation = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const userId = req.user?.userId as string;
  const result = await distributorManagerService.createSubstation(
    payload,
    userId,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Substation created successfully",
    data: result,
  });
});

const createPowerOperator = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const userId = req.user?.userId as string;
  const result = await distributorManagerService.createPowerOperator(
    payload,
    userId,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Power operator created successfully",
    data: result,
  });
});

export const distributorManagerController = {
  createSubstation,
  createPowerOperator,
};
