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
export const LoadSheddingRoutes = router;
