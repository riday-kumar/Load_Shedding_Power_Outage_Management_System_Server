import { Request, Response } from "express";
import catchAsync from "../../utility/catchAsync";
import { subscriptionService } from "./subscription.service";
import { sendResponse } from "../../utility/sendResponse";
import httpStatus from "http-status";

const createSubscription = catchAsync(async (req: Request, res: Response) => {
  const currentUserId = req.user?.userId;
  const result = await subscriptionService.createSubscription(
    currentUserId as string,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Subscription Initiated Successfully",
    data: result,
  });
});

const payForSubscription = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const user = req.user!;
  const result = await subscriptionService.payForSubscription(payload, user);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Subscription Payment Initiated Successfully",
    data: result,
  });
});

const createSubscriptionCallback = catchAsync(
  async (req: Request, res: Response) => {
    const { redirectUrl } =
      await subscriptionService.createSubscriptionCallback(req.query);

    res.redirect(redirectUrl);
  },
);

export const subscriptionController = {
  createSubscription,
  payForSubscription,
  createSubscriptionCallback,
};
