import { Request, Response } from "express";
import catchAsync from "../../utility/catchAsync";
import { adminService } from "./admin.service";
import httpStatus from "http-status";
import { sendResponse } from "../../utility/sendResponse";

const createPowerAuthority = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const powerAuthority = await adminService.createPowerAuthority(payload);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Power authority created successfully",
    data: powerAuthority,
  });
});

const createDistributor = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const distributor = await adminService.createDistributor(payload);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Distributor created successfully",
    data: distributor,
  });
});

const createDistributorManager = catchAsync(
  async (req: Request, res: Response) => {
    const payload = req.body;
    const distributorManager =
      await adminService.createDistributorManager(payload);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Distributor manager created successfully",
      data: distributorManager,
    });
  },
);

const allUsers = catchAsync(async (req: Request, res: Response) => {
  let payload;

  if (req.query.role) {
    payload = req.query.role as string;
  } else {
    payload = null;
  }

  const users = await adminService.allUsers(payload);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "All users retrieved successfully",
    data: users,
  });
});

const allDistributorManager = catchAsync(
  async (req: Request, res: Response) => {
    const distributorsManager = await adminService.allDistributorManager();
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "All distributor managers retrieved successfully",
      data: distributorsManager,
    });
  },
);

export const adminController = {
  createPowerAuthority,
  createDistributor,
  createDistributorManager,
  allUsers,
  allDistributorManager,
};
