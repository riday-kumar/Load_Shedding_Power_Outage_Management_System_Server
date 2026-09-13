import {
  PaymentStatus,
  SubscriptionStatus,
} from "../../../generated/prisma/enums";
import config from "../../config";
import { grantToken } from "../../config/bkash";
import { prisma } from "../../lib/prisma";
import { ReqUser } from "../../middlewares/checkAuth";
import { AppError } from "../../utility/AppError";
import httpStatus from "http-status";

const createSubscription = async (userID: string) => {
  const transactionResult = await prisma.$transaction(
    async (tx) => {
      const user = await tx.user.findUnique({
        where: {
          id: userID,
        },
      });

      if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
      }

      const now = new Date();

      const existingSubscription = await tx.subscription.findFirst({
        where: {
          userId: userID,
          expiresAt: {
            gte: now,
          },
        },
      });

      if (existingSubscription?.status === SubscriptionStatus.PENDING) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          "User already has a pending subscription.Please Pay first",
        );
      }

      if (existingSubscription?.status === SubscriptionStatus.ACTIVE) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          "User already has a active subscription",
        );
      }

      // create subscription
      const subscription = await tx.subscription.create({
        data: {
          userId: userID,

          status: SubscriptionStatus.PENDING,
          plan: "1 year",
        },
      });

      // make bkash payment url
      const bkashIdToken = await grantToken();
      if (!bkashIdToken) {
        throw new Error("No Bkash Access Token found");
      }

      const amount = 100;

      const bkashCreatePaymentResponse = await fetch(
        `${config.bkash_base_url}/tokenized/checkout/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: bkashIdToken,
            "X-App-Key": config.bkash_app_key,
          },
          body: JSON.stringify({
            mode: "0011",
            // payerReference: "0175305788", // user email or phn num
            payerReference: user.email,
            callbackURL: `${config.bkash_callback_url}/subscription/payment/callback`,
            amount: amount,
            currency: "BDT",
            intent: "sale",
            // merchantInvoiceNumber: "Inv403", // subscription id(unique)
            merchantInvoiceNumber: subscription.id, // subscription id(unique)
          }),
        },
      );

      const bkashCreatePaymentResult = await bkashCreatePaymentResponse.json();

      await tx.payment.create({
        data: {
          userId: userID,
          merchantInvoiceNumber: bkashCreatePaymentResult.merchantInvoiceNumber,
          subscriptionId: subscription.id,
          amount: amount,
          gatewayResponse: bkashCreatePaymentResult,
          bkashPaymentId: bkashCreatePaymentResult.paymentID,
          payerReference: user.email,
        },
      });

      return {
        paymentUrl: bkashCreatePaymentResult.bkashURL,
      };
    },
    {
      timeout: 10000,
    },
  );
  return transactionResult;
};

const payForSubscription = async (payload: any, user: ReqUser) => {
  const subscriptionId = payload.subscriptionId;

  const existingSubscription = await prisma.subscription.findUnique({
    where: {
      id: subscriptionId,
    },
  });

  if (!existingSubscription) {
    throw new AppError(httpStatus.NOT_FOUND, "Subscription not found");
  }

  if (existingSubscription.status !== SubscriptionStatus.PENDING) {
    throw new AppError(httpStatus.BAD_REQUEST, "Subscription not pending");
  }

  const amount = 100;

  const bkashIdToken = await grantToken();

  if (!bkashIdToken) {
    throw new AppError(httpStatus.BAD_REQUEST, "No Bkash Access Token found");
  }

  const bkashCreatePaymentResponse = await fetch(
    `${config.bkash_base_url}/tokenized/checkout/create`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: bkashIdToken,
        "X-App-Key": config.bkash_app_key,
      },
      body: JSON.stringify({
        mode: "0011",
        // payerReference: "0175305788", // user email or phn num
        payerReference: user.email,
        callbackURL: `${config.bkash_callback_url}/subscription/payment/callback`,
        amount: amount,
        currency: "BDT",
        intent: "sale",
        // merchantInvoiceNumber: "Inv403", // subscription id(unique)
        merchantInvoiceNumber: existingSubscription.id, // subscription id(unique)
      }),
    },
  );

  const bkashCreatePaymentResult = await bkashCreatePaymentResponse.json();
  // console.log("bkashCreatePaymentResult", bkashCreatePaymentResult);

  await prisma.payment.update({
    where: {
      subscriptionId: existingSubscription.id,
    },
    data: {
      merchantInvoiceNumber: bkashCreatePaymentResult.merchantInvoiceNumber,
      gatewayResponse: bkashCreatePaymentResult,
      bkashPaymentId: bkashCreatePaymentResult.paymentID,
    },
  });

  return {
    paymentUrl: bkashCreatePaymentResult.bkashURL,
  };
};

const createSubscriptionCallback = async (query: Record<string, any>) => {
  const transactionResult = await prisma.$transaction(
    async (tx) => {
      const paymentId = query.paymentID;
      const status = query.status;

      if (!paymentId) {
        throw new AppError(httpStatus.BAD_REQUEST, "Payment ID not found");
      }

      if (!status) {
        throw new AppError(httpStatus.BAD_REQUEST, "Status not found");
      }

      const bkashIdToken = await grantToken();

      if (!bkashIdToken) {
        throw new AppError(httpStatus.BAD_REQUEST, "No Bkash Id Token found");
      }

      const bkashSubscriptionPaymentExecute = await fetch(
        `${config.bkash_base_url}/tokenized/checkout/execute`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            Accept: "application/json",
            Authorization: bkashIdToken,
            "X-App-Key": config.bkash_app_key,
          },
          body: JSON.stringify({
            paymentID: paymentId,
          }),
        },
      );

      const subscriptionPaymentExecuteResult =
        await bkashSubscriptionPaymentExecute.json();

      if (status === "success") {
        const subscription = await prisma.subscription.findUnique({
          where: {
            id: subscriptionPaymentExecuteResult.merchantInvoiceNumber,
          },
        });

        if (!subscription) {
          throw new AppError(httpStatus.NOT_FOUND, "Subscription not found");
        }

        const now = new Date();

        await tx.subscription.update({
          where: {
            id: subscriptionPaymentExecuteResult.merchantInvoiceNumber,
          },
          data: {
            status: SubscriptionStatus.ACTIVE,
            startedAt: new Date(),
            expiresAt: new Date(
              now.getFullYear() + 1,
              now.getMonth(),
              now.getDate(),
            ),
          },
        });

        await tx.payment.update({
          where: {
            bkashPaymentId: paymentId,
          },
          data: {
            status: PaymentStatus.PAID,
            bkashTrxId: subscriptionPaymentExecuteResult.trxID,
            paidAt: subscriptionPaymentExecuteResult.paymentExecuteTime,
            gatewayResponse: subscriptionPaymentExecuteResult,
          },
        });

        return {
          redirectUrl: `${config.frontend_url}/dashboard/my-subscriptions?status=success`,
        };
      } else if (status === "failure") {
        await tx.payment.update({
          where: {
            // appointmentID : AppointmentPaymentExecuteResult.merchantInvoiceNumber,
            bkashPaymentId: paymentId,
          },
          data: {
            status: PaymentStatus.FAILED,
            gatewayResponse: subscriptionPaymentExecuteResult,
          },
        });

        return {
          redirectUrl: `${config.frontend_url}/dashboard/my-subscriptions?status=failure`,
        };
      } else if (status === "cancel") {
        await tx.payment.update({
          where: {
            // appointmentID : AppointmentPaymentExecuteResult.merchantInvoiceNumber,
            bkashPaymentId: paymentId,
          },
          data: {
            status: PaymentStatus.CANCELLED,
            gatewayResponse: subscriptionPaymentExecuteResult,
          },
        });
        return {
          redirectUrl: `${config.frontend_url}/dashboard/my-subscriptions?status=cancel`,
        };
      } else {
        return {
          redirectUrl: `${config.frontend_url}/dashboard/my-subscriptions?error=payment-failed`,
        };
      }
    },
    { maxWait: 10000, timeout: 30000 },
  );

  return transactionResult;
};

export const subscriptionService = {
  createSubscription,
  payForSubscription,
  createSubscriptionCallback,
};
