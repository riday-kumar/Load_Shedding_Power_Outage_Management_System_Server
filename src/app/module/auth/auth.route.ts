import { Router } from "express";
import { authController } from "./auth.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { authValidation } from "./auth.validation";

const router = Router();

router.post(
  "/register",
  validateRequest(authValidation.RegisterUserSchema),
  authController.registerUser,
);

router.post(
  "/verify-email",
  validateRequest(authValidation.EmailVerifyZodSchema),
  authController.verifyUserEmail,
);
router.post("/google", authController.googleLogin);

export const AuthRoutes = router;
