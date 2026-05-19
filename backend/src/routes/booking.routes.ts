// ===========================================================
// booking.routes.ts - a hirer applies for a venue 
// ===========================================================
// Mounted at /api/bookings. Only a signed-in hirer may apply,
// and the body is validated by CreateBookingDTO before the
// controller runs (week9 validateDto pattern).
// ===========================================================

import { Router } from "express";
import { BookingController } from "../controller/bookingController";
import { requireAuth, requireRole } from "../middlewares/auth";
import { validateDto } from "../middlewares/validate";
import { CreateBookingDTO } from "../dtos/create-booking.dto";

const router = Router();
const bookingController = new BookingController();

router.post(
  "/",
  requireAuth,
  requireRole("hirer"),
  validateDto(CreateBookingDTO),
  (req, res) => bookingController.createBooking(req, res),
);

export default router;
