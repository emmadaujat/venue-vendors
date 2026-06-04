// hirerController.ts - all hirer-side endpoints: dashboard, saved venues, bookings,
// reputation, compliance, and profile. Identity always comes from req.user.id (JWT).

import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import { Venue } from "../entity/Venue";
import { Application } from "../entity/Application";
import { Booking } from "../entity/Booking";
import { SavedVenue } from "../entity/SavedVenue";
import { ComplianceDocument } from "../entity/ComplianceDocument";
import { computeAverageReputation } from "../utils/reputation";

export class HirerController {
  private userRepository = AppDataSource.getRepository(User);
  private venueRepository = AppDataSource.getRepository(Venue);
  private applicationRepository = AppDataSource.getRepository(Application);
  private bookingRepository = AppDataSource.getRepository(Booking);
  private savedVenueRepository = AppDataSource.getRepository(SavedVenue);
  private complianceRepository = AppDataSource.getRepository(ComplianceDocument);

  private hirerId(req: Request): number {
    return req.user!.id;
  }

  async getDashboard(req: Request, res: Response) {
    const hirerID = this.hirerId(req);

    const applications = await this.applicationRepository.find({
      where: { hirer: { userID: hirerID } },
      relations: { booking: true },
    });

    const savedCount = await this.savedVenueRepository.count({
      where: { hirer: { userID: hirerID } },
    });

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

  async getSavedVenues(req: Request, res: Response) {
    const hirerID = this.hirerId(req);

    const saved = await this.savedVenueRepository.find({
      where: { hirer: { userID: hirerID } },
      relations: { venue: { amenities: true, suitabilityTags: true } },
      order: { rankingOrder: "ASC" },
    });

    res.json(saved);
  }

  async addSavedVenue(req: Request, res: Response) {
    const hirerID = this.hirerId(req);
    const { venueID, rankingOrder } = req.body;

    const venue = await this.venueRepository.findOneBy({ venueID });
    if (!venue) {
      return res.status(404).json({ message: "Venue not found" });
    }

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

  async getMyBookings(req: Request, res: Response) {
    const hirerID = this.hirerId(req);

    const applications = await this.applicationRepository.find({
      where: { hirer: { userID: hirerID } },
      relations: { venue: true, booking: true },
      order: { submittedAt: "DESC" },
    });

    res.json(applications);
  }

  async getReputation(req: Request, res: Response) {
    const hirerID = this.hirerId(req);

    const applications = await this.applicationRepository.find({
      where: { hirer: { userID: hirerID } },
      relations: { venue: true, booking: true },
      order: { eventDate: "DESC" },
    });

    const ratedHistory = applications
      .filter((a) => a.booking && a.booking.hirerReputationRating > 0)
      .map((a) => ({
        applicationID: a.applicationID,
        venueName: a.venue?.name,
        eventName: a.eventName,
        eventDate: a.eventDate,
        rating: a.booking!.hirerReputationRating,
      }));

    const averageRating = computeAverageReputation(
      ratedHistory.map((h) => h.rating),
    );

    res.json({ averageRating, totalRated: ratedHistory.length, history: ratedHistory });
  }

  async getMyCompliance(req: Request, res: Response) {
    const hirerID = this.hirerId(req);

    const documents = await this.complianceRepository.find({
      where: { hirer: { userID: hirerID } },
      order: { uploadedAt: "DESC" },
    });

    const score = Math.min(5, documents.length);

    res.json({ documents, complianceScore: score });
  }

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
