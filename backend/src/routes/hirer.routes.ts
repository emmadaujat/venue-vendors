import { Router } from "express";
import { HirerController } from "../controller/hirerController";
import { requireAuth, requireRole } from "../middlewares/auth";
import { validateDto } from "../middlewares/validate";
import { CreateSavedVenueDTO, UpdateSavedVenueDTO } from "../dtos/saved-venue.dto";
import { CreateComplianceDTO } from "../dtos/create-compliance.dto";
import { UpdateProfileDTO } from "../dtos/update-profile.dto";

const router = Router();
const hirerController = new HirerController();

router.use(requireAuth, requireRole("hirer"));

router.get("/dashboard", (req, res) => hirerController.getDashboard(req, res));

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

router.get("/bookings", (req, res) => hirerController.getMyBookings(req, res));
router.get("/reputation", (req, res) => hirerController.getReputation(req, res));

router.get("/compliance", (req, res) => hirerController.getMyCompliance(req, res));
router.post("/compliance", validateDto(CreateComplianceDTO), (req, res) =>
  hirerController.addCompliance(req, res),
);

router.put("/profile", validateDto(UpdateProfileDTO), (req, res) =>
  hirerController.updateProfile(req, res),
);

export default router;
