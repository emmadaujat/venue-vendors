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

  // -------------------------------------------------------------------
  // ------------------ GET A VENDORS VENUES -----------------------------
  // -------------------------------------------------------------------
  async getVendorVenues(req: Request, res: Response) {
    console.log(req.params.vendorID);

    /** Retrieve the profile from the database */
    const vendor = await this.userRepository.findOneBy({
      userID: parseInt(req.params.vendorID as string),
    });

    /** Check if the vendor exists, if not, return a 404 error */
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    /** Retrieve all venues associated with the profile from the database */
    const venues = await this.venueRepository.find({
      where: { vendor: { userID: vendor.userID } },
    });

    /** Return the venues */
    res.json(venues);
  }
}
