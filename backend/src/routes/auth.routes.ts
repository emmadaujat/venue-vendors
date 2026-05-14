import { Router } from "express";
import { AuthController } from "../controller/authController";

const router = Router();
const authController = new AuthController();

router.get("/test", async (req, res) => {
  res.json({ message: "vendor routes working" });
});

router.post("/register", async (req, res) => {
  await authController.register(req, res);
});

router.post("/signin", async (req, res) => {
  await authController.signIn(req, res);
});

router.get("/users/:id/profile", async (req, res) => {
  await authController.getUserProfile(req, res);
});

export default router;
