import { Router } from "express";
import { emergencyOutageController } from "./emergency-outage.controller";
import { auth } from "../../middlewares/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { validateRequest } from "../../middlewares/validateRequest";
import { emergencyOutageValidation } from "./emergency-outage.validation";

const router = Router();

router.post(
  "/",
  auth(Role.CUSTOMER),
  validateRequest(emergencyOutageValidation.CreateEmergencyOutageSchema),
  emergencyOutageController.createEmergencyOutage,
);

router.get(
  "/",
  auth(Role.POWER_OPERATOR),
  emergencyOutageController.getEmergencyOutage,
);

router.patch(
  "/status/verify/:id",
  auth(Role.POWER_OPERATOR),
  emergencyOutageController.verifyEmergencyOutage,
);

router.get(
  "/available-technician",
  auth(Role.POWER_OPERATOR),
  emergencyOutageController.getAvailableTechnician,
);

router.patch(
  "/status/technician/assign/:id",
  auth(Role.POWER_OPERATOR),
  emergencyOutageController.assignTechnician,
);

router.patch(
  "/status/under-repair/:id",
  auth(Role.POWER_OPERATOR),
  emergencyOutageController.changeStatusToUnderRepair,
);

router.patch(
  "/status/resolve/:id",
  auth(Role.POWER_OPERATOR),
  emergencyOutageController.changeStatusToResolve,
);

export const EmergencyOutageRoutes = router;
