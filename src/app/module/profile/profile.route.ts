import { Router } from "express";
import { auth } from "../../middlewares/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { upload } from "../../lib/multer";
import { profileController } from "./profile.controller";

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

export const ProfileRoutes = router;
