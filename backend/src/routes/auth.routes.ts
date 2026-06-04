// auth.routes.ts - public auth endpoints: register, sign-in, and get user profile.
import { Router } from "express";
import { AuthController } from "../controller/authController";
import { requireAuth } from "../middlewares/auth";
import { RegisterDTO } from "../dtos/register.dto";
import { validateDto } from "../middlewares/validate";

const router = Router();
const authController = new AuthController();

router.post("/register", validateDto(RegisterDTO), async (req, res) => {
  await authController.register(req, res);
});

router.post("/signin", async (req, res) => {
  await authController.signIn(req, res);
});

router.get("/users/:id/profile", requireAuth, async (req, res) => {
  await authController.getUserProfile(req, res);
});

export default router;
