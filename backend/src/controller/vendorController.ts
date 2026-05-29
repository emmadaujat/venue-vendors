import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import { Application } from "../entity/Application";
import { Venue } from "../entity/Venue";
import { Booking } from "../entity/Booking";
import { VendorComment } from "../entity/VendorComment";
import { HirerReputationTag } from "../entity/HirerReputationTag";

export class VendorController {
  private userRepository = AppDataSource.getRepository(User);
  private applicationRepository = AppDataSource.getRepository(Application);
  private venueRepository = AppDataSource.getRepository(Venue);
  private bookingRepository = AppDataSource.getRepository(Booking);
  private commentRepository = AppDataSource.getRepository(VendorComment);

  /**
   * @param request - Express request object containing user details in body
   * @param response - Express response object
   * @returns JSON response containing the created user or error message
   */

  // Helper: get the logged-in vendor's ID from the verified JWT.
  private vendorID(req: Request): number {
    return req.user!.id;
  }

  // -------------------------------------------------------------------
  // ------------------ GET APPLICANTS FOR VENDORS VENUES --------------
  // -------------------------------------------------------------------
  // GET /api/vendor/applicants
  async getVendorApplicants(req: Request, res: Response) {
    // find the vendor
    const vendorID = this.vendorID(req);

    /** Retrieve all applications associated with the vendor from the database */
    const applications = await this.applicationRepository.find({
      where: { venue: { vendor: { userID: vendorID } } },
      relations: { hirer: true, venue: true, reputationTags: { reputationTag: true } },
      select: {
        hirer: {
          userID: true,
          firstName: true,
          lastName: true,
          email: true,
          phoneNumber: true,
          joinedDate: true,
        },
      },
    });

    /** Return the applications */
    res.json(applications);
  }

  // ------------------------------------------------------------------------------
  // ------------------ UPDATE APPLICATION STATUS FOR VENDORS VENUES --------------
  // ------------------------------------------------------------------------------
  // PUT /api/vendor/applications/:applicationID/status
  // Update the status (Pending/Approved/Declined) of an application.
  async updateApplicationStatus(req: Request, res: Response) {
    const vendorID = this.vendorID(req); // get from JWT
    const applicationID = parseInt(req.params.applicationID as string);
    const { status } = req.body;

    let applicationToUpdate = await this.applicationRepository.findOne({
      where: { applicationID },
      relations: { venue: { vendor: true } },
    });

    if (!applicationToUpdate) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (applicationToUpdate.venue.vendor.userID !== vendorID) {
      return res.status(403).json({ message: "Not authorised to update this application" });
    }

    // only update the status in application
    applicationToUpdate = Object.assign(applicationToUpdate, {
      status,
    });

    try {
      const updatedApplication = await this.applicationRepository.save(applicationToUpdate);
      return res.json(updatedApplication);
    } catch (error) {
      return res.status(400).json({ message: "Error updating application status", error });
    }
  }

  // -------------------------------------------------------------------
  // ------------------ GET BOOKINGS FOR THIS VENDORS VENUES --------------
  // -------------------------------------------------------------------
  // GET /api/vendor/bookings
  async getVendorBookings(req: Request, res: Response) {
    // find the vendor
    const vendorID = this.vendorID(req);

    const bookings = await this.bookingRepository.find({
      where: { application: { venue: { vendor: { userID: vendorID } } } },
      relations: {
        application: {
          hirer: true,
          venue: true,
        },
        vendorComments: true,
      },
      select: {
        application: {
          applicationID: true,
          eventName: true,
          eventType: true,
          eventDate: true,
          guestCount: true,
          additionalNotes: true,
          status: true,
          submittedAt: true,
          venue: {
            venueID: true,
            name: true,
            location: true,
            pricePerDay: true,
          },
          hirer: {
            userID: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            joinedDate: true,
          },
        },
      },
    });

    res.json(bookings);
  }

  // ------------------------------------------------------------------------------------------
  // ------------------ GET COMMENTS ON ACCEPTED BOOKINGS FOR VENDORS APPLICANTS --------------
  // ------------------------------------------------------------------------------------------
  // GET /api/vendor/comments
  // Retrieve all comments this vendor has left on bookings.
  async getVendorComments(req: Request, res: Response) {
    // find the vendor
    const vendorID = this.vendorID(req);

    const comments = await this.commentRepository.find({
      where: { booking: { application: { venue: { vendor: { userID: vendorID } } } } },
      relations: {
        booking: {
          application: {
            hirer: true,
            venue: true,
          },
        },
      },
      select: {
        booking: {
          bookingID: true,
          status: true,
          createdAt: true,
          application: {
            applicationID: true,
            eventName: true,
            eventType: true,
            eventDate: true,
            guestCount: true,
            additionalNotes: true,
            status: true,
            submittedAt: true,
            venue: {
              venueID: true,
              name: true,
              location: true,
              pricePerDay: true,
            },
            hirer: {
              userID: true,
              firstName: true,
              lastName: true,
              email: true,
              phoneNumber: true,
              joinedDate: true,
            },
          },
        },
      },
    });
    res.json(comments);
  }

  // ------------------------------------------------------------------------------------------
  // ------------------ DELETE A COMMENT ON ACCEPTED BOOKINGS FOR THIS VENDORS APPLICANTS --------------
  // ------------------------------------------------------------------------------------------
  // DELETE /api/vendor/comments/:commentID
  async deleteVendorComment(req: Request, res: Response) {
    const vendorID = this.vendorID(req);
    const commentID = parseInt(req.params.commentID as string);

    let commentToDelete = await this.commentRepository.findOne({
      where: { commentID },
      relations: { vendor: true },
    });

    if (!commentToDelete) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Ownership check: only the vendor who wrote the comment can delete it
    if (commentToDelete.vendor.userID !== vendorID) {
      return res.status(403).json({ message: "Not authorised to delete this comment" });
    }

    try {
      await this.commentRepository.remove(commentToDelete);
      return res.json({ message: "Comment deleted successfully" });
    } catch (error) {
      return res.status(400).json({ message: "Error deleting comment", error });
    }
  }

  // ------------------------------------------------------------------------------------------
  // ------------------ EDIT COMMENT ON ACCEPTED BOOKINGS FOR THIS VENDORS APPLICANTS --------------
  // ------------------------------------------------------------------------------------------
  async updateVendorComment(req: Request, res: Response) {
    const vendorID = this.vendorID(req);
    const commentID = parseInt(req.params.commentID as string);
    const { commentText, dateLastEdit } = req.body;

    let commentToUpdate = await this.commentRepository.findOne({
      where: { commentID },
      relations: { vendor: true },
    });

    if (!commentToUpdate) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Ownership check: only the vendor who wrote the comment can edit it
    if (commentToUpdate.vendor.userID !== vendorID) {
      return res.status(403).json({ message: "Not authorised to edit this comment" });
    }

    commentToUpdate = Object.assign(commentToUpdate, {
      commentText,
      dateLastEdit,
    });

    try {
      const updatedComment = await this.commentRepository.save(commentToUpdate);
      return res.json(updatedComment);
    } catch (error) {
      return res.status(400).json({ message: "Error updating comment ", error });
    }
  }

  // ------------------------------------------------------------------------------------------
  // ------------------ ADD A NEW COMMENT TO A BOOKINGS FOR THIS VENDORS VENUE ----------------
  // ------------------------------------------------------------------------------------------
  async createVendorComment(req: Request, res: Response) {
    const vendorID = this.vendorID(req);
    const bookingID = parseInt(req.params.bookingID as string);
    const { commentText } = req.body;

    // Load the booking with relations to verify it belongs to this vendor
    const booking = await this.bookingRepository.findOne({
      where: { bookingID },
      relations: { application: { venue: { vendor: true } } },
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Ownership check: only the venue's vendor can comment on its bookings
    if (booking.application.venue.vendor.userID !== vendorID) {
      return res.status(403).json({ message: "Not authorised to comment on this booking" });
    }

    const newComment = this.commentRepository.create({
      commentText,
      credibilityTag: "",
      vendor: { userID: vendorID },
      booking: { bookingID },
    });

    try {
      await this.commentRepository.save(newComment);
    } catch (error) {
      return res.status(500).json({ message: "Error saving comment ", error });
    }
    res.status(201).json(newComment);
  }

  // ------------------------------------------------------------------------------------------
  // ------------------ EDIT LOGGED IN VENDORS NAME / PHONE -----------------------------------
  // ------------------------------------------------------------------------------------------
  // edit logged in vendors name / phone number
  async updateProfile(req: Request, res: Response) {
    const vendorID = this.vendorID(req);

    const user = await this.userRepository.findOneBy({ userID: vendorID });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { firstName, lastName, phoneNumber, displayName } = req.body;
    user.firstName = firstName;
    user.lastName = lastName;
    user.phoneNumber = phoneNumber;
    if (displayName !== undefined) user.displayName = displayName;

    try {
      await this.userRepository.save(user);
    } catch (error) {
      return res.status(500).json({ message: "Error updating profile", error });
    }

    // Send back the safe fields only (never the password hash).
    res.json({
      userID: user.userID,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      joinedDate: user.joinedDate,
    });
  }

  // --------------------------------------------------------------------------------
  // -------- GET A HIRERS APPROVED APPLICATIONS/ BOOKINGS ACROSS ALL VENUES --------
  // --------------------------------------------------------------------------------
  // Used by the vendor to view a hirer's full historical hire list.
  // hirerID comes from the URL param, not the JWT.
  async getHirerBookingHistory(req: Request, res: Response) {
    // get hirerID from URL
    const hirerID = parseInt(req.params.hirerID as string);

    // check hirer exists
    const hirerExists = await this.userRepository.findOne({
      where: { userID: hirerID, role: "hirer" },
    });
    if (!hirerExists) return res.status(404).json({ message: "Hirer not found" });

    const bookings = await this.bookingRepository.find({
      where: { application: { hirer: { userID: hirerID } } },
      relations: { application: { venue: true, hirer: true } },
      order: { createdAt: "DESC" },
    });
    return res.json(bookings);
  }
}
