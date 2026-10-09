import { Router } from "express";
import { auth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { powerAuthController } from "./power-auth.controller";
import { Role } from "../../../generated/prisma/enums";
import { powerAuthValidation } from "./power-auth.validation";

const router = Router();

router.get(
  "/national-level-electricity",
  powerAuthController.getNationalLevelElectricity,
);

router.post(
  "/national-level-electricity",
  auth(Role.POWER_AUTH),
  validateRequest(powerAuthValidation.CreateNationalLevelElectricitySchema),
  powerAuthController.nationalLevelElectricity,
);

router.get("/power-distribution", powerAuthController.getAllPowerDistribution);

router.post(
  "/power-distribution",
  auth(Role.POWER_AUTH),
  validateRequest(powerAuthValidation.createPowerDistributionSchema),
  powerAuthController.powerDistribution,
);

export const PowerAuthRoutes = router;
