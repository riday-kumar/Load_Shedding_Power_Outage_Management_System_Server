import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { sendResponse } from "../utility/sendResponse";

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  sendResponse(res, {
    statusCode: httpStatus.NOT_FOUND,
    success: false,
    message: "Sorry can not find this Route!",
    data: new Date(),
  });
};
