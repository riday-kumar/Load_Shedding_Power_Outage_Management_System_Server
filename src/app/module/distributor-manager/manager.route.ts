import { Router } from "express";
import { auth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { distributorManagerController } from "./manager.controller";
import { distributorManagerValidation } from "./manager.validation";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post(
  "/create-substation",
  auth(Role.DISTRIBUTOR_MANAGER),
  validateRequest(distributorManagerValidation.createSubstationSchema),
  distributorManagerController.createSubstation,
);

router.post(
  "/create-power-operator",
  auth(Role.DISTRIBUTOR_MANAGER),
  validateRequest(distributorManagerValidation.CreatePowerOperatorSchema),
  distributorManagerController.createPowerOperator,
);

export const DistributorManagerRoutes = router;
