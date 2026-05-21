import { Router } from "express";
import { AuthController } from "../controller/authController";
import { requireAuth } from "../middlewares/auth";
import { RegisterDTO } from "../dtos/register.dto";
import { validateDto } from "../middlewares/validate";

const router = Router();
const authController = new AuthController();

// Register a new user (vendor or hirer).
// Validates request body against RegisterDTO before hitting controller.
// -------------------------------------------------------------------
router.post("/register", validateDto(RegisterDTO), async (req, res) => {
  await authController.register(req, res);
});

// Sign in with email and password, returns a JWT token on success.
router.post("/signin", async (req, res) => {
  await authController.signIn(req, res);
});

// Get a user's profile by ID. Requires a valid JWT (requireAuth).
router.get("/users/:id/profile", requireAuth, async (req, res) => {
  await authController.getUserProfile(req, res);
});

export default router;
