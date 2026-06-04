// Public venue browsing - no auth required. Mounted at /api/venues.
// The more-specific "/:id/suitability" route is registered before "/:id" so Express matches it first.

import { Router } from "express";
import { VenueBrowseController } from "../controller/venueBrowseController";

const router = Router();
const venueBrowseController = new VenueBrowseController();

router.get("/", (req, res) => venueBrowseController.getAllVenues(req, res));

router.get("/stats", (req, res) => venueBrowseController.getPlatformStats(req, res));

router.get("/:id/suitability", (req, res) => venueBrowseController.getVenueSuitability(req, res));

router.get("/:id", (req, res) => venueBrowseController.getVenueById(req, res));

export default router;
