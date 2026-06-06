// venueController.ts - vendor-side venue management: CRUD operations and blocked-date management.
import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import { Venue } from "../entity/Venue";
import { VenueAmenities } from "../entity/VenueAmenities";
import { VenueSuitabilityTag } from "../entity/VenueSuitabilityTag";
import { VenueBlockedDates } from "../entity/VenueBlockedDates";

export class VenueController {
  private userRepository = AppDataSource.getRepository(User);
  private venueRepository = AppDataSource.getRepository(Venue);
  private amenityRepository = AppDataSource.getRepository(VenueAmenities);
  private suitabilityTagRepository = AppDataSource.getRepository(VenueSuitabilityTag);
  private venueBlockedDates = AppDataSource.getRepository(VenueBlockedDates);

  private vendorID(req: Request): number {
    return req.user!.id;
  }

  // -------------------------------------------------------------------
  // ------------------ GET A VENDORS VENUES ---------------------------
  // -------------------------------------------------------------------
  // including amenities and suitability tags for each venue.
  async getVendorVenues(req: Request, res: Response) {
    const vendorID = this.vendorID(req);

    const venues = await this.venueRepository.find({
      where: { vendor: { userID: vendorID } },
      relations: { amenities: true, suitabilityTags: true },
    });

    // Flatten relational amenity/tag rows into string arrays expected by the frontend.
    const mappedVenues = venues.map((venue) => ({
      ...venue,
      amenities: venue.amenities.map((a) => a.amenityName),
      suitabilityTags: venue.suitabilityTags.map((t) => t.suitabilityName),
    }));

    console.log("first venue amenities:", mappedVenues[0]?.amenities);

    res.json(mappedVenues);
  }

  // -------------------------------------------------------------------
  // ------------------ UPDATE A VENUE ---------------------------------
  // -------------------------------------------------------------------
  // Updates venue details, amenities and suitability tags.
  // Amenities and suitability tags are delete-then-reinserted because they are stored
  // in separate tables with no unique constraint to upsert on.
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
  // Amenities/tags/blocked dates are removed via cascade. Applications referencing the
  // venue have venueID set to NULL (onDelete: SET NULL) to preserve booking history.
  async deleteVenue(req: Request, res: Response) {
    const vendorID = this.vendorID(req);
    const venueID = parseInt(req.params.venueID as string);

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
      // Manually delete related records first as cascade is not working
      await this.amenityRepository.delete({ venue: { venueID } });
      await this.suitabilityTagRepository.delete({ venue: { venueID } });
      await this.venueBlockedDates.delete({ venue: { venueID } });

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

  // -------------------------------------------------------------------
  // ------------------ GET VENUES BLOCKED DATES -----------------------
  // -------------------------------------------------------------------
  // fetches all blocked periods for a venue
  async getVenueBlockedDates(req: Request, res: Response) {
    const vendorID = this.vendorID(req);
    const venueId = parseInt(req.params.venueId as string);

    const venue = await this.venueRepository.findOne({
      where: { venueID: venueId, vendor: { userID: vendorID } },
    });

    if (!venue) {
      return res.status(404).json({ message: "Venue not found or not authorised" });
    }

    // Fetch all blocked date records for this venue
    const blockedDates = await this.venueBlockedDates.find({
      where: { venue: { venueID: venueId } },
    });

    return res.json(blockedDates);
  }

  // -------------------------------------------------------------------
  // ------------------ CREATE VENUES BLOCKED DATES --------------------
  // -------------------------------------------------------------------
  // creates a new blocked period for a venue
  async createVenueBlockedDates(req: Request, res: Response) {
    const vendorID = this.vendorID(req);
    const venueId = parseInt(req.params.venueId as string);
    const { startDate, endDate, reason } = req.body;

    const venue = await this.venueRepository.findOne({
      where: { venueID: venueId, vendor: { userID: vendorID } },
    });

    if (!venue) {
      return res.status(404).json({ message: "Venue not found or not authorised" });
    }

    // Convert YYYY-MM-DD strings from the DTO into Date objects for the entity
    const newBlockout = this.venueBlockedDates.create({
      venue,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
    });

    const saved = await this.venueBlockedDates.save(newBlockout);
    return res.status(201).json(saved);
  }

  // -------------------------------------------------------------------
  // ------------------ DELETE VENUES BLOCKED DATES --------------------
  // -------------------------------------------------------------------
  // removes a blocked period by ID
  async deleteVenueBlockedDates(req: Request, res: Response) {
    const vendorID = this.vendorID(req);
    const venueId = parseInt(req.params.venueId as string);
    const blockDateId = parseInt(req.params.blockDateId as string);

    const venue = await this.venueRepository.findOne({
      where: { venueID: venueId, vendor: { userID: vendorID } },
    });

    if (!venue) {
      return res.status(404).json({ message: "Venue not found or not authorised" });
    }

    // Find the specific blocked date record
    const blockout = await this.venueBlockedDates.findOne({
      where: { blockedID: blockDateId, venue: { venueID: venueId } },
    });

    if (!blockout) {
      return res.status(404).json({ message: "Blocked date not found" });
    }

    await this.venueBlockedDates.remove(blockout);
    return res.json({ message: "Blocked period removed successfully" });
  }
}
