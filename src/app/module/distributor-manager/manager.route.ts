import { Router } from "express";
import { auth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { distributorManagerController } from "./manager.controller";
import { distributorManagerValidation } from "./manager.validation";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.get(
  "/substation",
  auth(Role.DISTRIBUTOR_MANAGER),
  distributorManagerController.getSubstationForManager,
);

router.post(
  "/substation",
  auth(Role.DISTRIBUTOR_MANAGER),
  validateRequest(distributorManagerValidation.createSubstationSchema),
  distributorManagerController.createSubstation,
);

router.patch(
  "/substation/:substationId",
  auth(Role.DISTRIBUTOR_MANAGER),
  distributorManagerController.updateSubstation,
);

router.post(
  "/create-power-operator",
  auth(Role.DISTRIBUTOR_MANAGER),
  validateRequest(distributorManagerValidation.CreatePowerOperatorSchema),
  distributorManagerController.createPowerOperator,
);

router.post(
  "/power-allocate-into-substation",
  auth(Role.DISTRIBUTOR_MANAGER),
  distributorManagerController.powerAllocateIntoSubstation,
);

router.get("/feeder", distributorManagerController.getAllFeeder);

router.post(
  "/create-feeder",
  auth(Role.DISTRIBUTOR_MANAGER),
  validateRequest(distributorManagerValidation.createFeederSchema),
  distributorManagerController.createFeeder,
);

router.post(
  "/create-technician",
  auth(Role.DISTRIBUTOR_MANAGER),
  validateRequest(distributorManagerValidation.createTechnicianSchema),
  distributorManagerController.createTechnician,
);

export const DistributorManagerRoutes = router;
