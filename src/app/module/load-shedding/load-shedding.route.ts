import { Router } from "express";
import { loadSheddingController } from "./load-shedding.controller";
import { auth } from "../../middlewares/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { validateRequest } from "../../middlewares/validateRequest";
import { LoadSheddingValidationSchema } from "./load-shedding.validation";

const router = Router();
router.post(
  "/schedule",
  auth(Role.POWER_OPERATOR),
  validateRequest(LoadSheddingValidationSchema.createLoadSheddingSchema),
  loadSheddingController.createLoadSheddingSchedule,
);

router.patch(
  "/schedule/:id/approve",
  auth(Role.DISTRIBUTOR_MANAGER),
  loadSheddingController.approveSchedule,
);

router.patch(
  "/schedule/:id/reject",
  auth(Role.DISTRIBUTOR_MANAGER),
  loadSheddingController.rejectSchedule,
);

router.patch(
  "/schedule/:id/publish",
  auth(Role.POWER_OPERATOR),
  loadSheddingController.publishSchedule,
);

export const LoadSheddingRoutes = router;
