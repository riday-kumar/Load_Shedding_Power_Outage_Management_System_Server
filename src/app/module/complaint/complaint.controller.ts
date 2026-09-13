import { Request, Response } from "express";
import catchAsync from "../../utility/catchAsync";
import { complaintService } from "./complaint.service";
import { sendResponse } from "../../utility/sendResponse";
import httpStatus from "http-status";

const createComplaint = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const userId = req.user?.userId as string;

  const result = await complaintService.createComplaint(payload, userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Complaint created successfully",
    data: result,
  });
});

const getComplaintsToPowerOperator = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;

    const result = await complaintService.getComplaintsToPowerOperator(userId);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Complaints to power operator",
      data: result,
    });
  },
);

const approvedComplaint = catchAsync(async (req: Request, res: Response) => {
  const complaintId = req.body.complaintId as string;
  const result = await complaintService.approvedComplaint(complaintId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Complaint approved successfully",
    data: result,
  });
});

export const complaintController = {
  createComplaint,
  getComplaintsToPowerOperator,
  approvedComplaint,
};
