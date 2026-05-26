import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import { Venue } from "../entity/Venue";
import { VenueAmenities } from "../entity/VenueAmenities";
import { VenueSuitabilityTag } from "../entity/VenueSuitabilityTag";

export class VenueController {
  private userRepository = AppDataSource.getRepository(User);
  private venueRepository = AppDataSource.getRepository(Venue);
  private amenityRepository = AppDataSource.getRepository(VenueAmenities);
  private suitabilityTagRepository = AppDataSource.getRepository(VenueSuitabilityTag);

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
  // ------------------ GET A VENDORS VENUES ---------------------------
  // -------------------------------------------------------------------
  // including amenities and suitability tags for each venue.
  async getVendorVenues(req: Request, res: Response) {
    const vendorID = this.vendorID(req);

    /** Retrieve all venues associated with the profile from the database */
    const venues = await this.venueRepository.find({
      where: { vendor: { userID: vendorID } },
      relations: { amenities: true, suitabilityTags: true },
    });

    // Map related entities to flat string arrays to match frontend Venue type
    const mappedVenues = venues.map((venue) => ({
      ...venue,
      amenities: venue.amenities.map((a) => a.amenityName),
      suitabilityTags: venue.suitabilityTags.map((t) => t.suitabilityName),
    }));

    console.log("first venue amenities:", mappedVenues[0]?.amenities);

    /** Return the venues */
    res.json(mappedVenues);
  }

  // -------------------------------------------------------------------
  // ------------------ UPDATE A VENUE ---------------------------------
  // -------------------------------------------------------------------
  // Updates venue details, amenities and suitability tags.
  // Uses delete-then-reinsert for amenities and tags since they are
  // stored in separate tables with no unique constraints to upsert on.
  async updateVenue(req: Request, res: Response) {
    const vendorID = this.vendorID(req);
    const venueID = parseInt(req.params.venueID as string);
    const {
      name,
      location,
      capacity,
      pricePerDay,
      shortDescription,
      imageURL,
      availabilityStatus,
      amenities,
      suitabilityTags,
    } = req.body;

    // Find venue and verify ownership
    const venue = await this.venueRepository.findOne({
      where: { venueID },
      relations: { vendor: true },
    });

    if (!venue) {
      return res.status(404).json({ message: "Venue not found" });
    }

    if (venue.vendor.userID !== vendorID) {
      return res.status(403).json({ message: "Not authorised to edit this venue" });
    }

    // Update main venue fields
    venue.name = name;
    venue.location = location;
    venue.capacity = capacity;
    venue.pricePerDay = pricePerDay;
    venue.shortDescription = shortDescription;
    venue.imageURL = imageURL;
    venue.availabilityStatus = availabilityStatus;

    try {
      // Save updated venue fields first
      await this.venueRepository.save(venue);

      // Delete old amenities and suitability tags then reinsert new ones
      await this.amenityRepository.delete({ venue: { venueID } });
      await this.suitabilityTagRepository.delete({ venue: { venueID } });

      // Insert new amenities
      if (amenities && amenities.length > 0) {
        const newAmenities = amenities.map((amenityName: string) =>
          this.amenityRepository.create({ amenityName, venue: { venueID } }),
        );
        await this.amenityRepository.save(newAmenities);
      }

      // Insert new suitability tags
      if (suitabilityTags && suitabilityTags.length > 0) {
        const newTags = suitabilityTags.map((suitabilityName: string) =>
          this.suitabilityTagRepository.create({ suitabilityName, venue: { venueID } }),
        );
        await this.suitabilityTagRepository.save(newTags);
      }

      return res.json({ message: "Venue updated successfully" });
    } catch (error) {
      return res.status(500).json({ message: "Error updating venue", error });
    }
  }

  // -------------------------------------------------------------------
  // ------------------ DELETE A VENUE ---------------------------------
  // -------------------------------------------------------------------
  // Delete a venue. Amenities, suitability tags and blocked dates are
  // removed via cascade. Applications referencing this venue have their
  // venueID set to NULL (onDelete: SET NULL on Application entity)
  // so booking history is preserved.
  async deleteVenue(req: Request, res: Response) {
    const vendorID = this.vendorID(req);
    const venueID = parseInt(req.params.venueID as string);

    // Find venue and verify ownership
    const venue = await this.venueRepository.findOne({
      where: { venueID },
      relations: { vendor: true },
    });

    if (!venue) {
      return res.status(404).json({ message: "Venue not found" });
    }

    if (venue.vendor.userID !== vendorID) {
      return res.status(403).json({ message: "Not authorised to delete this venue" });
    }

    try {
      await this.venueRepository.remove(venue);
      return res.json({ message: "Venue deleted successfully" });
    } catch (error) {
      return res.status(500).json({ message: "Error deleting venue", error });
    }
  }

  // -------------------------------------------------------------------
  // ------------------ CREATE A VENUE ---------------------------------
  // -------------------------------------------------------------------
  // Create a new venue for the logged-in vendor
  async createVenue(req: Request, res: Response) {
    const vendorID = this.vendorID(req);
    const {
      name,
      location,
      capacity,
      pricePerDay,
      shortDescription,
      imageURL,
      availabilityStatus,
      amenities,
      suitabilityTags,
    } = req.body;

    // Check if this vendor already has a venue with the same name and location
    const existingVenue = await this.venueRepository.findOne({
      where: {
        name,
        location,
        vendor: { userID: vendorID },
      },
    });

    if (existingVenue) {
      return res.status(409).json({
        message: "You already have a venue with this name and location.",
      });
    }

    try {
      // Create and save the venue first
      const newVenue = this.venueRepository.create({
        name,
        location,
        capacity,
        pricePerDay,
        shortDescription,
        imageURL,
        availabilityStatus,
        rating: 0,
        reviewCount: 0,
        vendor: { userID: vendorID },
      });

      const savedVenue = await this.venueRepository.save(newVenue);

      // Insert amenities if provided
      if (amenities && amenities.length > 0) {
        const newAmenities = amenities.map((amenityName: string) =>
          this.amenityRepository.create({ amenityName, venue: { venueID: savedVenue.venueID } }),
        );
        await this.amenityRepository.save(newAmenities);
      }

      // Insert suitability tags if provided
      if (suitabilityTags && suitabilityTags.length > 0) {
        const newTags = suitabilityTags.map((suitabilityName: string) =>
          this.suitabilityTagRepository.create({
            suitabilityName,
            venue: { venueID: savedVenue.venueID },
          }),
        );
        await this.suitabilityTagRepository.save(newTags);
      }

      return res.status(201).json({ message: "Venue created successfully" });
    } catch (error) {
      return res.status(500).json({ message: "Error creating venue", error });
    }
  }
}
