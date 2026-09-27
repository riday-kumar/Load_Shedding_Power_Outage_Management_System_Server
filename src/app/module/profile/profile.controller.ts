import catchAsync from "../../utility/catchAsync";
import { Request, Response } from "express";
import { profileService } from "./profile.service";
import { sendResponse } from "../../utility/sendResponse";
import httpStatus from "http-status";

const profileImage = catchAsync(async (req: Request, res: Response) => {
  const fileBuffer = req.file?.buffer;
  console.log(fileBuffer);

  if (!fileBuffer) {
    throw new Error("please upload file");
  }

  const userId = req.user?.userId;

  const result = await profileService.uploadProfileImage(fileBuffer, userId!);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Profile Image uploaded successfully",
    data: result,
  });
});

const profileUpdate = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  const userId = req.user?.userId;

  const result = await profileService.profileUpdate(payload, userId!);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile updated successfully",
    data: result,
  });
});

export const profileController = { profileImage, profileUpdate };
