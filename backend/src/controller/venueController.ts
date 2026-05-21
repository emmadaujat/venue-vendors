import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import { Venue } from "../entity/Venue";

export class VenueController {
  private userRepository = AppDataSource.getRepository(User);
  private venueRepository = AppDataSource.getRepository(Venue);

  /**
   * @param request - Express request object containing user details in body
   * @param response - Express response object
   * @returns JSON response containing the created user or error message
   */

  // get the logged-in vendor's ID from the verified JWT.
  private vendorID(req: Request): number {
    return req.user!.id;
  }

  // -------------------------------------------------------------------
  // ------------------ GET A VENDORS VENUES -----------------------------
  // -------------------------------------------------------------------
  async getVendorVenues(req: Request, res: Response) {
    const vendorID = this.vendorID(req);

    /** Retrieve all venues associated with the profile from the database */
    const venues = await this.venueRepository.find({
      where: { vendor: { userID: vendorID } },
    });

    /** Return the venues */
    res.json(venues);
  }
}
