import { Router } from "express";
import { AuthController } from "../controller/authController";

const router = Router();
const authController = new AuthController();

router.post("/register", async (req, res) => {
  await authController.register(req, res);
});

router.post("/signin", async (req, res) => {
  await authController.signIn(req, res);
});

export default router;
