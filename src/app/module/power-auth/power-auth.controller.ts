import { Request, Response } from "express";
import catchAsync from "../../utility/catchAsync";
import { powerAuthServices } from "./power-auth.service";
import { sendResponse } from "../../utility/sendResponse";
import httpStatus from "http-status";

const nationalLevelElectricity = catchAsync(
  async (req: Request, res: Response) => {
    const payload = req.body;
    const userId = req.user?.userId as string;
    const result = await powerAuthServices.nationalLevelElectricity(
      payload,
      userId,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "National level electricity created successfully",
      data: result,
    });
  },
);
export const powerAuthController = {
  nationalLevelElectricity,
};
