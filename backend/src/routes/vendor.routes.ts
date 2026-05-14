import { Router } from "express";
import { VenueController } from "../controller/venueController";
import { VendorController } from "../controller/vendorController";

const router = Router();
const venueController = new VenueController();
const vendorController = new VendorController();

// endpoint GET /api/:vendorID/venues
router.get("/:vendorID/venues", async (req, res) => {
  await venueController.getVendorVenues(req, res);
});

router.get("/:vendorID/applications", async (req, res) => {
  await vendorController.getVendorApplicants(req, res);
});

export default router;
