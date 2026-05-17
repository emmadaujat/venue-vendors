import { Router } from "express";
import { VenueController } from "../controller/venueController";
import { VendorController } from "../controller/vendorController";
import { requireAuth, requireRole } from "../middlewares/auth";
import { UpdateApplicationStatusDTO } from "../dtos/update-application-status.dto";
import { validateDto } from "../middlewares/validate";
import { VendorCommentDTO } from "../dtos/vendor-comment.dto";

const router = Router();
const venueController = new VenueController();
const vendorController = new VendorController();

// endpoint GET /api/:vendorID/venues
router.get("/:vendorID/venues", requireAuth, requireRole("vendor"), async (req, res) => {
  await venueController.getVendorVenues(req, res);
});

router.get("/:vendorID/applications", requireAuth, requireRole("vendor"), async (req, res) => {
  await vendorController.getVendorApplicants(req, res);
});

router.get("/:vendorID/bookings", requireAuth, requireRole("vendor"), async (req, res) => {
  await vendorController.getVendorBookings(req, res);
});

router.get("/:vendorID/comments", requireAuth, requireRole("vendor"), async (req, res) => {
  await vendorController.getVendorComments(req, res);
});

router.put(
  "/:vendorID/applications/:applicationID",
  requireAuth,
  requireRole("vendor"),
  validateDto(UpdateApplicationStatusDTO),
  async (req, res) => {
    await vendorController.updateApplicationStatus(req, res);
  },
);

router.delete(
  "/:vendorID/comments/:commentID",
  requireAuth,
  requireRole("vendor"),
  async (req, res) => {
    await vendorController.deleteVendorComment(req, res);
  },
);

router.put(
  "/:vendorID/comments/:commentID",
  requireAuth,
  requireRole("vendor"),
  validateDto(VendorCommentDTO),
  async (req, res) => {
    await vendorController.updateVendorComment(req, res);
  },
);

router.post(
  "/:vendorID/comments/:bookingID",
  requireAuth,
  requireRole("vendor"),
  validateDto(VendorCommentDTO),
  async (req, res) => {
    await vendorController.createVendorComment(req, res);
  },
);

export default router;
