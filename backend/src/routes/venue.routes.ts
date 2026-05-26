// ===========================================================
// venue.routes.ts - public venue browsing
// ===========================================================
// Browsing venues is public (a visitor can look before signing
// up), so these routes do NOT use requireAuth. Mounted at
// /api/venues in index.ts.
//
// Route order matters: the more specific "/:id/suitability" is
// listed before "/:id" so Express matches it correctly.
// ===========================================================

import { Router } from "express";
import { VenueBrowseController } from "../controller/venueBrowseController";

const router = Router();
const venueBrowseController = new VenueBrowseController();

router.get("/", (req, res) => venueBrowseController.getAllVenues(req, res));

router.get("/:id/suitability", (req, res) => venueBrowseController.getVenueSuitability(req, res));

router.get("/:id", (req, res) => venueBrowseController.getVenueById(req, res));

export default router;
