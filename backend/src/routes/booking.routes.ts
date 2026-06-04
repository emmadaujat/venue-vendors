// booking.routes.ts - hirer-only booking submission route. Mounted at /api/bookings.
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
