import { Request, Response } from "express";
import catchAsync from "../../utility/catchAsync";
import { sendResponse } from "../../utility/sendResponse";
import { distributorManagerService } from "./manager.service";
import httpStatus from "http-status";

const getSubstationForManager = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const result =
      await distributorManagerService.getSubstationForManager(userId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Substation fetched successfully For the Manager",
      data: result,
    });
  },
);

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

const updateSubstation = catchAsync(async (req: Request, res: Response) => {
  const substationId = req.params.substationId as string;
  const payload = req.body;
  const userId = req.user?.userId as string;
  const result = await distributorManagerService.updateSubstation(
    substationId,
    payload,
    userId,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Substation Updated successfully",
    data: result,
  });
});

const getPowerOperatorsForManager = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const result =
      await distributorManagerService.getPowerOperatorsForManager(userId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Power operators fetched successfully For the Manager",
      data: result,
    });
  },
);

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

const powerAllocateIntoSubstation = catchAsync(
  async (req: Request, res: Response) => {
    const payload = req.body;
    const userId = req.user?.userId as string;
    const result = await distributorManagerService.powerAllocateIntoSubstation(
      payload,
      req.query?.distributor_company_id as string,
      userId,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Power allocated to the substations successfully",
      data: result,
    });
  },
);

const getAllFeeder = catchAsync(async (req: Request, res: Response) => {
  // const { area } = req.query;
  let area = req.query.area || "";
  const creator = req.query.creator || "";

  const result = await distributorManagerService.allFeeder(
    area as string,
    creator as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All Feeder Fetched successfully",
    data: result,
  });
});

const createFeeder = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  console.log("payload", payload);
  const userId = req.user?.userId as string;
  const result = await distributorManagerService.createFeeder(payload, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Feeder created successfully",
    data: result,
  });
});

const updateFeeder = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const userId = req.user?.userId as string;
  const result = await distributorManagerService.updateFeeder(payload, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Feeder updated successfully",
    data: result,
  });
});

const getTechnicians = catchAsync(async (req: Request, res: Response) => {
  const { managerId, substationId } = req.query;
  // const userId = req.user?.userId as string;
  const result = await distributorManagerService.getTechnicians(
    managerId as string,
    substationId as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Technician fetched successfully",
    data: result,
  });
});
const createTechnician = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const userId = req.user?.userId as string;
  const result = await distributorManagerService.createTechnician(
    payload,
    userId,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Technician created successfully",
    data: result,
  });
});

export const distributorManagerController = {
  getSubstationForManager,
  createSubstation,
  updateSubstation,
  getPowerOperatorsForManager,
  createPowerOperator,
  powerAllocateIntoSubstation,
  getAllFeeder,
  createFeeder,
  updateFeeder,
  getTechnicians,
  createTechnician,
};
