import { Router } from "express";
import { authController } from "./auth.controller";

const router = Router();

router.post("/google", authController.googleLogin);

export const AuthRoutes = router;
