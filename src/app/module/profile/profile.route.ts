import { Router } from "express";
import { auth } from "../../middlewares/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { upload } from "../../lib/multer";
import { profileController } from "./profile.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { profileValidation } from "./profile.validation";

const router = Router();
router.patch(
  "/profile-image",
  auth(
    Role.ADMIN,
    Role.CUSTOMER,
    Role.DISTRIBUTOR_MANAGER,
    Role.POWER_AUTH,
    Role.POWER_OPERATOR,
    Role.TECHNICIAN,
  ),
  upload.single("profileImage"),
  profileController.profileImage,
);

router.patch(
  "/profile-update",
  auth(
    Role.ADMIN,
    Role.CUSTOMER,
    Role.DISTRIBUTOR_MANAGER,
    Role.POWER_AUTH,
    Role.POWER_OPERATOR,
    Role.TECHNICIAN,
  ),
  profileController.profileUpdate,
);

router.patch(
  "/update-password",
  auth(
    Role.ADMIN,
    Role.CUSTOMER,
    Role.DISTRIBUTOR_MANAGER,
    Role.POWER_AUTH,
    Role.POWER_OPERATOR,
    Role.TECHNICIAN,
  ),
  validateRequest(profileValidation.ResetPasswordZodSchema),
  profileController.resetPassword,
);

export const ProfileRoutes = router;
