import { Router } from "express";
import { complaintController } from "./complaint.controller";
import { auth } from "../../middlewares/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { validateRequest } from "../../middlewares/validateRequest";
import { complaintValidation } from "./complaint.validation";

const router = Router();
router.post(
  "/",
  auth(Role.CUSTOMER),
  validateRequest(complaintValidation.CreateComplaintSchema),
  complaintController.createComplaint,
);

router.get(
  "/power-operator",
  auth(Role.POWER_OPERATOR),
  complaintController.getComplaintsToPowerOperator,
);

router.patch(
  "/approved",
  auth(Role.POWER_OPERATOR),
  complaintController.approvedComplaint,
);

export const ComplaintRoutes = router;
