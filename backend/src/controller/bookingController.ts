// ===========================================================
// bookingController.ts - a HIRER applies to hire a venue
// ===========================================================
//   POST /api/bookings   (body validated by CreateBookingDTO)
//
// "Applying" creates an Application row with status "pending".
// The vendor later approves/rejects it. We do a few
// safety checks here that the DTO alone cannot do because they
// need the database:
//
//   1. the venue must exist
//   2. guestCount must not exceed the venue's capacity
//   3. the event date must be today or later
//   4. the date must NOT fall inside a blocked date range the
//      vendor set for that venue  -> 409 "timeslot blocked"
//
// Check 4 prevents the race condition described in the spec: a
// vendor blocks a date, but a stale browser still shows it free.
// ===========================================================

import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Venue } from "../entity/Venue";
import { Application } from "../entity/Application";

export class BookingController {
  private venueRepository = AppDataSource.getRepository(Venue);
  private applicationRepository = AppDataSource.getRepository(Application);

  // POST /api/bookings
  async createBooking(req: Request, res: Response) {
    // The hirer is whoever the JWT says it is (set by requireAuth).
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

    // 1. Venue must exist. We also load its blocked dates so we
    //    can run check 4 below.
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

    // 3. The event date must be today or in the future.
    //    Compare date-only (ignore the time part).
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

    // All checks passed — create the pending application.
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
