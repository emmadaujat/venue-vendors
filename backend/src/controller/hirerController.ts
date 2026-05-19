// ===========================================================
// hirerController.ts - everything a logged-in HIRER can do
// ===========================================================
//   GET    /api/hirer/dashboard       -> summary numbers
//   GET    /api/hirer/saved           -> my saved venues (ranked)
//   POST   /api/hirer/saved           -> save a venue
//   PUT    /api/hirer/saved/:id       -> change a saved venue's rank
//   DELETE /api/hirer/saved/:id       -> remove a saved venue
//   GET    /api/hirer/bookings        -> my applications + status
//   GET    /api/hirer/reputation      -> my average stars + history
//   GET    /api/hirer/compliance      -> my documents + score
//   PUT    /api/hirer/profile         -> edit my name / phone
//
// SECURITY RULE (from the spec): we ALWAYS use the id from the
// verified JWT (req.user.id) and NEVER trust an id sent by the
// browser. That way a hirer can only ever see/change their OWN
// data. requireAuth + requireRole("hirer") run before these.
//
// Pattern follows the week9 lecture PetController/ProfileController.
// ===========================================================

import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import { Venue } from "../entity/Venue";
import { Application } from "../entity/Application";
import { Booking } from "../entity/Booking";
import { SavedVenue } from "../entity/SavedVenue";
import { ComplianceDocument } from "../entity/ComplianceDocument";

export class HirerController {
  private userRepository = AppDataSource.getRepository(User);
  private venueRepository = AppDataSource.getRepository(Venue);
  private applicationRepository = AppDataSource.getRepository(Application);
  private bookingRepository = AppDataSource.getRepository(Booking);
  private savedVenueRepository = AppDataSource.getRepository(SavedVenue);
  private complianceRepository = AppDataSource.getRepository(ComplianceDocument);

  // Small helper: the logged-in hirer's id, taken from the JWT.
  private hirerId(req: Request): number {
    return req.user!.id;
  }

  // -------------------------------------------------------------------
  // GET /api/hirer/dashboard
  // -------------------------------------------------------------------
  // Numbers shown on the dashboard cards: how many applications,
  // how many saved venues, and the hirer's average reputation.
  async getDashboard(req: Request, res: Response) {
    const hirerID = this.hirerId(req);

    const applications = await this.applicationRepository.find({
      where: { hirer: { userID: hirerID } },
      relations: { booking: true },
    });

    const savedCount = await this.savedVenueRepository.count({
      where: { hirer: { userID: hirerID } },
    });

    // Average reputation from bookings that actually have a rating.
    const ratings = applications
      .map((a) => a.booking?.hirerReputationRating)
      .filter((r): r is number => typeof r === "number" && r > 0);

    let averageRating = 0;
    if (ratings.length > 0) {
      const sum = ratings.reduce((total, r) => total + r, 0);
      averageRating = parseFloat((sum / ratings.length).toFixed(1));
    }

    res.json({
      totalApplications: applications.length,
      savedVenues: savedCount,
      averageRating,
      totalRatings: ratings.length,
    });
  }

  // -------------------------------------------------------------------
  // GET /api/hirer/saved
  // -------------------------------------------------------------------
  // The hirer's saved venues, lowest rankingOrder first (1 = top).
  async getSavedVenues(req: Request, res: Response) {
    const hirerID = this.hirerId(req);

    const saved = await this.savedVenueRepository.find({
      where: { hirer: { userID: hirerID } },
      relations: { venue: { amenities: true, suitabilityTags: true } },
      order: { rankingOrder: "ASC" },
    });

    res.json(saved);
  }

  // -------------------------------------------------------------------
  // POST /api/hirer/saved   body: { venueID, rankingOrder }
  // -------------------------------------------------------------------
  async addSavedVenue(req: Request, res: Response) {
    const hirerID = this.hirerId(req);
    const { venueID, rankingOrder } = req.body;

    // The venue must exist.
    const venue = await this.venueRepository.findOneBy({ venueID });
    if (!venue) {
      return res.status(404).json({ message: "Venue not found" });
    }

    // Don't let the same venue be saved twice by the same hirer.
    const already = await this.savedVenueRepository.findOne({
      where: { hirer: { userID: hirerID }, venue: { venueID } },
    });
    if (already) {
      return res.status(409).json({ message: "Venue already saved" });
    }

    const savedVenue = this.savedVenueRepository.create({
      hirer: { userID: hirerID },
      venue: { venueID },
      rankingOrder,
    });

    try {
      await this.savedVenueRepository.save(savedVenue);
    } catch (error) {
      return res.status(500).json({ message: "Error saving venue", error });
    }

    res.status(201).json(savedVenue);
  }

  // -------------------------------------------------------------------
  // PUT /api/hirer/saved/:id   body: { rankingOrder }
  // -------------------------------------------------------------------
  async updateSavedVenueRank(req: Request, res: Response) {
    const hirerID = this.hirerId(req);
    const savedVenueID = parseInt(req.params.id as string);

    const savedVenue = await this.savedVenueRepository.findOne({
      where: { savedVenueID },
      relations: { hirer: true },
    });

    if (!savedVenue) {
      return res.status(404).json({ message: "Saved venue not found" });
    }

    // Ownership check: a hirer can only re-rank their own saves.
    if (savedVenue.hirer.userID !== hirerID) {
      return res.status(403).json({ message: "Not your saved venue" });
    }

    savedVenue.rankingOrder = req.body.rankingOrder;

    try {
      await this.savedVenueRepository.save(savedVenue);
    } catch (error) {
      return res.status(500).json({ message: "Error updating rank", error });
    }

    res.json(savedVenue);
  }

  // -------------------------------------------------------------------
  // DELETE /api/hirer/saved/:id
  // -------------------------------------------------------------------
  async deleteSavedVenue(req: Request, res: Response) {
    const hirerID = this.hirerId(req);
    const savedVenueID = parseInt(req.params.id as string);

    const savedVenue = await this.savedVenueRepository.findOne({
      where: { savedVenueID },
      relations: { hirer: true },
    });

    if (!savedVenue) {
      return res.status(404).json({ message: "Saved venue not found" });
    }

    if (savedVenue.hirer.userID !== hirerID) {
      return res.status(403).json({ message: "Not your saved venue" });
    }

    await this.savedVenueRepository.remove(savedVenue);
    res.json({ message: "Saved venue removed" });
  }

  // -------------------------------------------------------------------
  // GET /api/hirer/bookings
  // -------------------------------------------------------------------
  // Every application this hirer has submitted, newest first, with
  // the venue and (if accepted) the booking attached so the page
  // can show the status and any vendor rating.
  async getMyBookings(req: Request, res: Response) {
    const hirerID = this.hirerId(req);

    const applications = await this.applicationRepository.find({
      where: { hirer: { userID: hirerID } },
      relations: { venue: true, booking: true },
      order: { submittedAt: "DESC" },
    });

    res.json(applications);
  }

  // -------------------------------------------------------------------
  // GET /api/hirer/reputation
  // -------------------------------------------------------------------
  // Average star rating vendors have given this hirer, plus the
  // history of rated past events. Empty history -> average is null
  // (so the page can show "not yet rated" instead of 0).
  async getReputation(req: Request, res: Response) {
    const hirerID = this.hirerId(req);

    const applications = await this.applicationRepository.find({
      where: { hirer: { userID: hirerID } },
      relations: { venue: true, booking: true },
      order: { eventDate: "DESC" },
    });

    // Only events the vendor actually rated.
    const ratedHistory = applications
      .filter((a) => a.booking && a.booking.hirerReputationRating > 0)
      .map((a) => ({
        applicationID: a.applicationID,
        venueName: a.venue?.name,
        eventName: a.eventName,
        eventDate: a.eventDate,
        rating: a.booking!.hirerReputationRating,
      }));

    let averageRating: number | null = null;
    if (ratedHistory.length > 0) {
      const sum = ratedHistory.reduce((total, h) => total + h.rating, 0);
      averageRating = parseFloat((sum / ratedHistory.length).toFixed(1));
    }

    res.json({ averageRating, totalRated: ratedHistory.length, history: ratedHistory });
  }

  // -------------------------------------------------------------------
  // GET /api/hirer/compliance
  // -------------------------------------------------------------------
  // The hirer's uploaded documents plus a 0–5 "compliance score".
  // Score = how many of the required docs they have provided
  // (capped at 5), matching the formula in the spec.
  async getMyCompliance(req: Request, res: Response) {
    const hirerID = this.hirerId(req);

    const documents = await this.complianceRepository.find({
      where: { hirer: { userID: hirerID } },
      order: { uploadedAt: "DESC" },
    });

    const score = Math.min(5, documents.length);

    res.json({ documents, complianceScore: score });
  }

  // -------------------------------------------------------------------
  // POST /api/hirer/compliance  (body validated by CreateComplianceDTO)
  // -------------------------------------------------------------------
  async addCompliance(req: Request, res: Response) {
    const hirerID = this.hirerId(req);
    const { documentType, fileName, fileURL, isBusiness, abnNumber } = req.body;

    const doc = this.complianceRepository.create({
      hirer: { userID: hirerID },
      documentType,
      fileName,
      fileURL,
      isBusiness: isBusiness ?? false,
      abnNumber,
    });

    try {
      await this.complianceRepository.save(doc);
    } catch (error) {
      return res.status(500).json({ message: "Error saving document", error });
    }

    res.status(201).json(doc);
  }

  // -------------------------------------------------------------------
  // PUT /api/hirer/profile  (body validated by UpdateProfileDTO)
  // -------------------------------------------------------------------
  // Edit the logged-in hirer's own name / phone. Email is never
  // changed here (it is the account identity).
  async updateProfile(req: Request, res: Response) {
    const hirerID = this.hirerId(req);

    const user = await this.userRepository.findOneBy({ userID: hirerID });
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
}
