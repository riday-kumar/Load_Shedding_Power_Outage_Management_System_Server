import { NextFunction, Request, Response } from "express";
import z from "zod";
import catchAsync from "../utility/catchAsync";
import httpStatus from "http-status";
import { AppError } from "../utility/AppError";

export const validateRequest = <T extends z.ZodTypeAny>(schema: T) => {
  return catchAsync((req: Request, res: Response, next: NextFunction) => {
    const validateResult = schema.safeParse(req.body);

    if (!validateResult.success) {
      console.log("validate result error", validateResult.error.issues);

      const errorMessage = validateResult.error.issues
        .map((issue) => issue.message)
        .join(", ");
      throw new AppError(httpStatus.BAD_REQUEST, errorMessage);
    }

    req.body = validateResult.data;
    next();
  });
};
