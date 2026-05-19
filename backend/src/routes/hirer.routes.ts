// ===========================================================
// hirer.routes.ts - protected hirer routes 
// ===========================================================
// Every route here needs a signed-in HIRER, so each one runs:
//   requireAuth           -> must have a valid JWT
//   requireRole("hirer")  -> the JWT's role must be "hirer"
// (the shared middleware). Mounted at /api/hirer.
// ===========================================================

import { Router } from "express";
import { HirerController } from "../controller/hirerController";
import { requireAuth, requireRole } from "../middlewares/auth";
import { validateDto } from "../middlewares/validate";
import { CreateSavedVenueDTO, UpdateSavedVenueDTO } from "../dtos/saved-venue.dto";
import { CreateComplianceDTO } from "../dtos/create-compliance.dto";
import { UpdateProfileDTO } from "../dtos/update-profile.dto";

const router = Router();
const hirerController = new HirerController();

// Everything below this line is hirer-only.
router.use(requireAuth, requireRole("hirer"));

// Dashboard summary numbers
router.get("/dashboard", (req, res) => hirerController.getDashboard(req, res));

// Saved venues (ranked list)
router.get("/saved", (req, res) => hirerController.getSavedVenues(req, res));
router.post("/saved", validateDto(CreateSavedVenueDTO), (req, res) =>
  hirerController.addSavedVenue(req, res),
);
router.put("/saved/:id", validateDto(UpdateSavedVenueDTO), (req, res) =>
  hirerController.updateSavedVenueRank(req, res),
);
router.delete("/saved/:id", (req, res) =>
  hirerController.deleteSavedVenue(req, res),
);

// My applications + status
router.get("/bookings", (req, res) => hirerController.getMyBookings(req, res));

// My reputation (average stars + history)
router.get("/reputation", (req, res) => hirerController.getReputation(req, res));

// My compliance documents + score
router.get("/compliance", (req, res) => hirerController.getMyCompliance(req, res));
router.post("/compliance", validateDto(CreateComplianceDTO), (req, res) =>
  hirerController.addCompliance(req, res),
);

// Edit my own details
router.put("/profile", validateDto(UpdateProfileDTO), (req, res) =>
  hirerController.updateProfile(req, res),
);

export default router;
