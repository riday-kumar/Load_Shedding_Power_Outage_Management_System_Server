import { Router } from "express";
import { adminController } from "./admin.controller";
import { auth } from "../../middlewares/checkAuth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();
router.post(
  "/create-power-authority",
  auth(Role.ADMIN),
  adminController.createPowerAuthority,
);
router.post(
  "/create-distributor",
  auth(Role.ADMIN),
  adminController.createDistributor,
);
router.post(
  "/create-distributor-manager",
  auth(Role.ADMIN),
  adminController.createDistributorManager,
);

export const AdminRoutes = router;
