import { Router } from "express";
import { VenueController } from "../controller/venueController";
import { VendorController } from "../controller/vendorController";
import { requireAuth, requireRole } from "../middlewares/auth";
import { UpdateApplicationStatusDTO } from "../dtos/update-application-status.dto";
import { validateDto } from "../middlewares/validate";
import { VendorCommentDTO } from "../dtos/vendor-comment.dto";
import { UpdateProfileDTO } from "../dtos/update-profile.dto";

const router = Router();
const venueController = new VenueController();
const vendorController = new VendorController();

// -------------------------------------------------------------------
// All routes in this file require a valid JWT and the "vendor" role.
// requireAuth verifies the token, requireRole checks the user's role.
// -------------------------------------------------------------------
router.use(requireAuth, requireRole("vendor"));

// Fetch all venues belonging to the logged-in vendor
router.get("/venues", async (req, res) => {
  await venueController.getVendorVenues(req, res);
});

// Fetch all applications submitted to the logged-in vendor's venues
router.get("/applications", async (req, res) => {
  await vendorController.getVendorApplicants(req, res);
});

// Fetch all bookings across the logged-in vendor's venues
router.get("/bookings", async (req, res) => {
  await vendorController.getVendorBookings(req, res);
});

// Fetch all comments the logged-in vendor has left on bookings
router.get("/comments", async (req, res) => {
  await vendorController.getVendorComments(req, res);
});

// Update the status (Pending/Approved/Declined) of an application.
// Validates request body against UpdateApplicationStatusDTO.
router.put(
  "/applications/:applicationID",
  validateDto(UpdateApplicationStatusDTO),
  async (req, res) => {
    await vendorController.updateApplicationStatus(req, res);
  },
);

// Delete a comment the logged-in vendor has left on a booking.
router.delete("/comments/:commentID", async (req, res) => {
  await vendorController.deleteVendorComment(req, res);
});

// Edit the text of an existing comment left by the logged-in vendor.
router.put("/comments/:commentID", validateDto(VendorCommentDTO), async (req, res) => {
  await vendorController.updateVendorComment(req, res);
});

// Add a new comment to a booking under the logged-in vendor's venue.
router.post("/bookings/comments/:bookingID", validateDto(VendorCommentDTO), async (req, res) => {
  await vendorController.createVendorComment(req, res);
});

// Update the logged-in vendor's name and phone number.
router.put("/profile", validateDto(UpdateProfileDTO), (req, res) =>
  vendorController.updateProfile(req, res),
);

export default router;
