// vendor.routes.ts - protected vendor-only routes. Mounted at /api/vendor.
import { Router } from "express";
import { VenueController } from "../controller/venueController";
import { VendorController } from "../controller/vendorController";
import { requireAuth, requireRole } from "../middlewares/auth";
import { UpdateApplicationStatusDTO } from "../dtos/update-application-status.dto";
import { validateDto } from "../middlewares/validate";
import { VendorCommentDTO } from "../dtos/vendor-comment.dto";
import { UpdateProfileDTO } from "../dtos/update-profile.dto";
import { ManageVenueDTO } from "../dtos/manage-venue.dto";
import { VenueBlockoutDTO } from "../dtos/venue-blockout.dto";

const router = Router();
const venueController = new VenueController();
const vendorController = new VendorController();

router.use(requireAuth, requireRole("vendor"));

router.get("/venues", async (req, res) => {
  await venueController.getVendorVenues(req, res);
});

router.get("/applications", async (req, res) => {
  await vendorController.getVendorApplicants(req, res);
});

router.get("/bookings", async (req, res) => {
  await vendorController.getVendorBookings(req, res);
});

router.get("/comments", async (req, res) => {
  await vendorController.getVendorComments(req, res);
});

router.put(
  "/applications/:applicationID",
  validateDto(UpdateApplicationStatusDTO),
  async (req, res) => {
    await vendorController.updateApplicationStatus(req, res);
  },
);

router.delete("/comments/:commentID", async (req, res) => {
  await vendorController.deleteVendorComment(req, res);
});

router.put("/comments/:commentID", validateDto(VendorCommentDTO), async (req, res) => {
  await vendorController.updateVendorComment(req, res);
});

router.post("/bookings/comments/:bookingID", validateDto(VendorCommentDTO), async (req, res) => {
  await vendorController.createVendorComment(req, res);
});

router.put("/profile", validateDto(UpdateProfileDTO), (req, res) =>
  vendorController.updateProfile(req, res),
);

router.put("/venues/:venueID", validateDto(ManageVenueDTO), async (req, res) => {
  await venueController.updateVenue(req, res);
});

router.delete("/venues/:venueID", async (req, res) => {
  await venueController.deleteVenue(req, res);
});

router.post("/venues", validateDto(ManageVenueDTO), async (req, res) => {
  await venueController.createVenue(req, res);
});

router.get("/hirers/:hirerID/bookings", async (req, res) => {
  await vendorController.getHirerBookingHistory(req, res);
});

router.get("/hirers/:hirerID/compliance", async (req, res) => {
  await vendorController.getHirerCompliance(req, res);
});

router.get("/venues/:venueId/blockedDates", async (req, res) => {
  await venueController.getVenueBlockedDates(req, res);
});

router.post("/venues/:venueId/blockedDates", validateDto(VenueBlockoutDTO), async (req, res) => {
  await venueController.createVenueBlockedDates(req, res);
});

router.delete("/venues/:venueId/blockedDates/:blockDateId", async (req, res) => {
  await venueController.deleteVenueBlockedDates(req, res);
});

export default router;
