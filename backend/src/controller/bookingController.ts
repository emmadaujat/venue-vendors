// bookingController.ts - creates a pending Application when a hirer applies to book a venue.
// Runs four database-level guards that the DTO cannot enforce:
//   1. venue must exist
//   2. guestCount must not exceed capacity
//   3. eventDate must be today or later
//   4. eventDate must not fall inside a vendor-set blocked range (409 "timeslot blocked")
// Guard 4 closes a race condition: the frontend reads blocked dates once on load, but a
// vendor may add a block between page load and submission.

import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Venue } from "../entity/Venue";
import { Application } from "../entity/Application";

export class BookingController {
  private venueRepository = AppDataSource.getRepository(Venue);
  private applicationRepository = AppDataSource.getRepository(Application);

  async createBooking(req: Request, res: Response) {
    const hirerID = req.user!.id;

    const {
      venueID,
      eventName,
      eventType,
      eventDate,
      eventEndDate,
      guestCount,
      additionalNotes,
    } = req.body;

    // 1. Venue must exist (also load blocked dates for check 4).
    const venue = await this.venueRepository.findOne({
      where: { venueID },
      relations: { blockedDates: true },
    });
    if (!venue) {
      return res.status(404).json({ message: "Venue not found" });
    }

    // 2. Don't allow more guests than the venue can hold.
    if (guestCount > venue.capacity) {
      return res.status(400).json({
        message: `This venue holds at most ${venue.capacity} guests`,
      });
    }

    // 3. The event date must be today or later (date-only comparison).
    const requestedDate = new Date(eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (requestedDate < today) {
      return res.status(400).json({ message: "Event date must be today or later" });
    }

    // 4. Reject if the date is inside any blocked range.
    const blocked = (venue.blockedDates || []).some((range) => {
      const start = new Date(range.startDate);
      const end = new Date(range.endDate);
      return requestedDate >= start && requestedDate <= end;
    });
    if (blocked) {
      return res.status(409).json({ message: "timeslot blocked" });
    }

    const application = this.applicationRepository.create({
      hirer: { userID: hirerID },
      venue: { venueID },
      eventName,
      eventType,
      eventDate: requestedDate,
      eventEndDate: eventEndDate ? new Date(eventEndDate) : undefined,
      guestCount,
      additionalNotes,
      status: "pending",
    });

    try {
      await this.applicationRepository.save(application);
    } catch (error) {
      return res.status(500).json({ message: "Error creating booking", error });
    }

    res.status(201).json(application);
  }
}
