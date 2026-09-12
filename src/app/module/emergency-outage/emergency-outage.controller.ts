import { Request, Response } from "express";
import catchAsync from "../../utility/catchAsync";
import { emergencyOutageService } from "./emergency-outage.service";
import { sendResponse } from "../../utility/sendResponse";
import httpStatus from "http-status";

const createEmergencyOutage = catchAsync(
  async (req: Request, res: Response) => {
    const payload = req.body;
    const userId = req.user?.userId!;
    const emergencyOutage = await emergencyOutageService.createEmergencyOutage(
      payload,
      userId,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Emergency outage created successfully",
      data: emergencyOutage,
    });
  },
);

const getEmergencyOutage = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId as string;

  const emergencyOutage =
    await emergencyOutageService.getEmergencyOutage(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Emergency outage fetched successfully",
    data: emergencyOutage,
  });
});

const verifyEmergencyOutage = catchAsync(
  async (req: Request, res: Response) => {
    const emergencyOutageId = req.params.id as string;

    const emergencyOutage =
      await emergencyOutageService.verifyEmergencyOutage(emergencyOutageId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Emergency outage verified successfully",
      data: emergencyOutage,
    });
  },
);

const getAvailableTechnician = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId!;
    const availableTechnician =
      await emergencyOutageService.getAvailableTechnician(userId);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message:
        "Available technicians from same substation fetched successfully",
      data: availableTechnician,
    });
  },
);

const assignTechnician = catchAsync(async (req: Request, res: Response) => {
  const emergencyOutageId = req.params.id as string;
  const userId = req.user?.userId!;
  const emergencyOutage = await emergencyOutageService.assignTechnician(
    emergencyOutageId,
    userId,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Technician assigned successfully",
    data: emergencyOutage,
  });
});

const changeStatusToUnderRepair = catchAsync(
  async (req: Request, res: Response) => {
    const emergencyOutageId = req.params.id as string;

    const emergencyOutage =
      await emergencyOutageService.changeStatusToUnderRepair(emergencyOutageId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Status changed successfully",
      data: emergencyOutage,
    });
  },
);

const changeStatusToResolve = catchAsync(
  async (req: Request, res: Response) => {
    const emergencyOutageId = req.params.id as string;
    const userId = req.user?.userId!;
    const emergencyOutage = await emergencyOutageService.changeStatusToResolved(
      emergencyOutageId,
      userId,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Status changed successfully",
      data: emergencyOutage,
    });
  },
);

export const emergencyOutageController = {
  createEmergencyOutage,
  getEmergencyOutage,
  verifyEmergencyOutage,
  getAvailableTechnician,
  assignTechnician,
  changeStatusToUnderRepair,
  changeStatusToResolve,
};
