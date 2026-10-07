import { Router } from "express";
import { adminController } from "./admin.controller";
import { auth } from "../../middlewares/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { validateRequest } from "../../middlewares/validateRequest";
import { adminValidation } from "./admin.validation";

const router = Router();
router.post(
  "/power-authority",
  auth(Role.ADMIN),
  validateRequest(adminValidation.CreatePowerAuthoritySchema),
  adminController.createPowerAuthority,
);

router.get("/distributor", adminController.allDistributorCompany);

router.post(
  "/distributor",
  auth(Role.ADMIN),
  validateRequest(adminValidation.CreateDistributorSchema),
  adminController.createDistributor,
);

router.patch(
  "/distributor/:distributorId/status",
  auth(Role.ADMIN),
  adminController.deleteDistributor,
);
router.post(
  "/distributor-manager",
  auth(Role.ADMIN),
  validateRequest(adminValidation.CreateDistributorManagerSchema),
  adminController.createDistributorManager,
);
router.get("/all-users", auth(Role.ADMIN), adminController.allUsers);
router.get(
  "/all-distributor-managers",
  auth(Role.ADMIN),
  adminController.allDistributorManager,
);

router.patch(
  "/users/:userId/status",
  auth(Role.ADMIN),

  adminController.updateUserStatus,
);

export const AdminRoutes = router;
