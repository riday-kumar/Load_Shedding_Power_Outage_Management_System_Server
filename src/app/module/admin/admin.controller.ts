import { Request, Response } from "express";
import catchAsync from "../../utility/catchAsync";
import { adminService } from "./admin.service";
import httpStatus from "http-status";
import { sendResponse } from "../../utility/sendResponse";
import { AppError } from "../../utility/AppError";
import { UserStatus } from "../../../generated/prisma/enums";

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

const allDistributorCompany = catchAsync(
  async (req: Request, res: Response) => {
    const result = await adminService.getAllDistributor();
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "All Distributor Company fetched successfully",
      data: result,
    });
  },
);

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

const deleteDistributor = catchAsync(async (req: Request, res: Response) => {
  const distributorId = req.params.distributorId;

  const result = await adminService.deleteDistributorCompany(
    distributorId as string,
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Distributor Company Deleted successfully",
    data: result,
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

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.userId as string;
  // console.log("user id", userId);
  const status = req.body.status;
  const result = await adminService.updateUserStatus(userId, status);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User Status Updated successfully",
    data: result,
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
  allDistributorCompany,
  createDistributor,
  deleteDistributor,
  createDistributorManager,
  allUsers,
  updateUserStatus,
  allDistributorManager,
};
