import { Router } from "express";
import { adminController } from "./admin.controller";
import { auth } from "../../middlewares/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { validateRequest } from "../../middlewares/validateRequest";
import { adminValidation } from "./admin.validation";

const router = Router();
router.post(
  "/create-power-authority",
  auth(Role.ADMIN),
  validateRequest(adminValidation.CreatePowerAuthoritySchema),
  adminController.createPowerAuthority,
);
router.post(
  "/create-distributor",
  auth(Role.ADMIN),
  validateRequest(adminValidation.CreateDistributorSchema),
  adminController.createDistributor,
);
router.post(
  "/create-distributor-manager",
  auth(Role.ADMIN),
  validateRequest(adminValidation.CreateDistributorManagerSchema),
  adminController.createDistributorManager,
);

export const AdminRoutes = router;
