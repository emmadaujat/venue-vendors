import { Router } from "express";
import { AuthController } from "../controller/authController";
import { requireAuth } from "../middlewares/auth";

const router = Router();
const authController = new AuthController();

router.post("/register", async (req, res) => {
  await authController.register(req, res);
});

router.post("/signin", async (req, res) => {
  await authController.signIn(req, res);
});

router.get("/users/:id/profile", requireAuth, async (req, res) => {
  await authController.getUserProfile(req, res);
});

export default router;
