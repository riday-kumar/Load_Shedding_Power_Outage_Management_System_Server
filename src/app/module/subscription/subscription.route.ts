import { Router } from "express";
import { auth } from "../../middlewares/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { subscriptionController } from "./subscription.controller";

const router = Router();

router.get("/", auth(Role.CUSTOMER), subscriptionController.getSubscription);

router.post(
  "/",
  auth(Role.CUSTOMER),
  subscriptionController.createSubscription,
);

router.post(
  "/pay-subscription",
  auth(Role.CUSTOMER),
  subscriptionController.payForSubscription,
);

router.get(
  "/payment/callback",
  subscriptionController.createSubscriptionCallback,
);

export const SubscriptionRoutes = router;
