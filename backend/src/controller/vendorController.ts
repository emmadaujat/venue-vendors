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

  // -------------------------------------------------------------------
  // ------------------ GET APPLICANTS FOR VENDORS VENUES --------------
  // -------------------------------------------------------------------
  async getVendorApplicants(req: Request, res: Response) {
    // find the vendor
    const vendor = await this.userRepository.findOneBy({
      userID: parseInt(req.params.vendorID as string),
    });

    /** Check if the vendor exists, if not, return a 404 error */
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    /** Retrieve all applications associated with the vendor from the database */
    const applications = await this.applicationRepository.find({
      where: { venue: { vendor: { userID: vendor.userID } } },
      relations: { hirer: true, venue: true, reputationTags: true },
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

  // -------------------------------------------------------------------
  // ------------------ GET BOOKINGS FOR VENDORS VENUES --------------
  // -------------------------------------------------------------------
  async getVendorBookings(req: Request, res: Response) {
    const vendor = await this.userRepository.findOneBy({
      userID: parseInt(req.params.vendorID as string),
    });

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    const bookings = await this.bookingRepository.find({
      where: { application: { venue: { vendor: { userID: vendor.userID } } } },
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
  async getVendorComments(req: Request, res: Response) {
    const vendor = await this.userRepository.findOneBy({
      userID: parseInt(req.params.vendorID as string),
    });

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    const comments = await this.commentRepository.find({
      where: { booking: { application: { venue: { vendor: { userID: vendor.userID } } } } },
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
}
