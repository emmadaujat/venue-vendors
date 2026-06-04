// venueBrowseController.ts - public (unauthenticated) venue browsing: list, search/filter,
// venue detail, suitability match, and platform stats. Separate from venueController.ts.

import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Venue } from "../entity/Venue";
import { Booking } from "../entity/Booking";

export class VenueBrowseController {
  private venueRepository = AppDataSource.getRepository(Venue);
  private bookingRepository = AppDataSource.getRepository(Booking);

  async getAllVenues(req: Request, res: Response) {
    const search = (req.query.search as string) || "";
    const location = (req.query.location as string) || "";
    const capacity = parseInt(req.query.capacity as string);
    const keyword = (req.query.keyword as string) || "";

    // vendor is excluded from relations to avoid returning password hashes.
    const venues = await this.venueRepository.find({
      relations: { amenities: true, suitabilityTags: true },
    });

    const filtered = venues.filter((venue) => {
      if (search) {
        const haystack = (venue.name + " " + venue.location).toLowerCase();
        if (!haystack.includes(search.toLowerCase())) return false;
      }

      if (location) {
        if (!venue.location.toLowerCase().includes(location.toLowerCase())) return false;
      }

      if (!isNaN(capacity)) {
        if (venue.capacity < capacity) return false;
      }

      if (keyword) {
        const tags = venue.suitabilityTags || [];
        const hasTag = tags.some((t) => t.suitabilityName.toLowerCase() === keyword.toLowerCase());
        if (!hasTag) return false;
      }

      return true;
    });

    res.json(filtered);
  }

  async getVenueById(req: Request, res: Response) {
    const venueID = parseInt(req.params.id as string);

    // vendor excluded from relations to avoid returning password hashes.
    const venue = await this.venueRepository.findOne({
      where: { venueID },
      relations: {
        amenities: true,
        suitabilityTags: true,
        blockedDates: true,
      },
    });

    if (!venue) {
      return res.status(404).json({ message: "Venue not found" });
    }

    res.json(venue);
  }

  async getVenueSuitability(req: Request, res: Response) {
    const venueID = parseInt(req.params.id as string);
    const eventType = (req.query.eventType as string) || "";

    const venue = await this.venueRepository.findOne({
      where: { venueID },
      relations: { suitabilityTags: true },
    });

    if (!venue) {
      return res.status(404).json({ message: "Venue not found" });
    }

    const tagNames = (venue.suitabilityTags || []).map((t) => t.suitabilityName);

    const matched = tagNames.filter((name) => name.toLowerCase() === eventType.toLowerCase());

    // score = matched / total; 0 if the venue has no tags.
    let score = 0;
    if (tagNames.length > 0) {
      score = parseFloat((matched.length / tagNames.length).toFixed(2));
    }

    res.json({ matched, score, allTags: tagNames });
  }

  async getPlatformStats(req: Request, res: Response) {
    const totalBookings = await this.bookingRepository.count();
    res.json({ totalBookings });
  }
}
