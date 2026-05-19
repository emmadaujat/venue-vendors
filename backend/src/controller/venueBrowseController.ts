// ===========================================================
// venueBrowseController.ts - PUBLIC venue browsing for hirers
// ===========================================================
// This is the hirer-facing side of venues:
//   GET /api/venues                 -> list + search/filter
//   GET /api/venues/:id             -> one venue + its details
//   GET /api/venues/:id/suitability -> how well it fits an event
//
// It is kept SEPARATE from venueController.ts (which is the
// vendor's "manage my own venues" side) so the two streams never
// edit the same file.
//
// Pattern copied from the week9 lecture PetController:
//   - get a repository with AppDataSource.getRepository(Entity)
//   - use repo.find(...) / repo.findOne(...)
//   - return res.json(...) or res.status(404).json(...)
// ===========================================================

import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Venue } from "../entity/Venue";

export class VenueBrowseController {
  private venueRepository = AppDataSource.getRepository(Venue);

  // -------------------------------------------------------------------
  // GET /api/venues?search=&location=&capacity=&keyword=
  // -------------------------------------------------------------------
  // All four query params are optional. If none are given we just
  // return every venue. We load the related amenities and
  // suitability tags so the venue cards have everything they need.
  async getAllVenues(req: Request, res: Response) {
    // Pull the optional filters off the query string.
    const search = (req.query.search as string) || "";
    const location = (req.query.location as string) || "";
    const capacity = parseInt(req.query.capacity as string); // NaN if absent
    const keyword = (req.query.keyword as string) || "";

    // Get every venue with its child rows attached.
    const venues = await this.venueRepository.find({
      relations: { amenities: true, suitabilityTags: true, vendor: true },
    });

    // Filter in plain JavaScript — easy to read and good enough for
    // the size of this assignment's dataset.
    const filtered = venues.filter((venue) => {
      // search: match against the venue name OR its location
      if (search) {
        const haystack = (venue.name + " " + venue.location).toLowerCase();
        if (!haystack.includes(search.toLowerCase())) return false;
      }

      // location: the location text must contain the chosen suburb
      if (location) {
        if (!venue.location.toLowerCase().includes(location.toLowerCase())) {
          return false;
        }
      }

      // capacity: only keep venues big enough for the guest count
      if (!isNaN(capacity)) {
        if (venue.capacity < capacity) return false;
      }

      // keyword: the venue must have a matching suitability tag
      // (e.g. keyword "Wedding" -> a tag whose name is "Wedding")
      if (keyword) {
        const tags = venue.suitabilityTags || [];
        const hasTag = tags.some(
          (t) => t.suitabilityName.toLowerCase() === keyword.toLowerCase(),
        );
        if (!hasTag) return false;
      }

      return true; // passed every active filter
    });

    res.json(filtered);
  }

  // -------------------------------------------------------------------
  // GET /api/venues/:id
  // -------------------------------------------------------------------
  // One venue plus everything the detail page needs, including the
  // blocked date ranges so the frontend can grey out unavailable
  // days on the calendar.
  async getVenueById(req: Request, res: Response) {
    const venueID = parseInt(req.params.id as string);

    const venue = await this.venueRepository.findOne({
      where: { venueID },
      relations: {
        amenities: true,
        suitabilityTags: true,
        blockedDates: true,
        vendor: true,
      },
    });

    if (!venue) {
      return res.status(404).json({ message: "Venue not found" });
    }

    res.json(venue);
  }

  // -------------------------------------------------------------------
  // GET /api/venues/:id/suitability?eventType=Wedding
  // -------------------------------------------------------------------
  // Returns which of the venue's suitability tags match the event
  // type the hirer picked, plus a 0–1 score (how many of the
  // venue's tags matched). Used for the coloured "match" chips.
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

    // Which tags match the chosen event type (case-insensitive)?
    const matched = tagNames.filter(
      (name) => name.toLowerCase() === eventType.toLowerCase(),
    );

    // Score = matched tags / total tags. Guard against divide-by-zero
    // when a venue has no tags yet.
    let score = 0;
    if (tagNames.length > 0) {
      score = parseFloat((matched.length / tagNames.length).toFixed(2));
    }

    res.json({ matched, score, allTags: tagNames });
  }
}
