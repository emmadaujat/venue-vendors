// ===========================================================
// vendorStatsController.ts - Data Insights (DI) for vendors
// ===========================================================
// This controller serves the four charts on the vendor's
// Infographic Report page:
//
//   1. Bar chart        - hirers' tallies per venue
//   2. Stacked bar      - all hirers' tallies across all venues
//   3. Pie chart        - most/least active hirers
//   4. Line chart       - venue utilization over time
//
// All four charts share the same time window the vendor picks
// in the UI:
//   range = week | month | lastMonth | all
//
// The window filters by Application.eventDate so the vendor
// sees activity that actually happened (or is scheduled) in
// that period.
//
// "Tally" means: one Application made by a hirer to one of the
// vendor's venues. Rejected applications are excluded because a
// rejection is not a real booking.
//
// Endpoint:
//   GET /api/vendor/stats?range=week|month|lastMonth|all
//
// Following the week9 lecture controller pattern (repository
// pattern, async methods returning res.json).
// ===========================================================

import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Application } from "../entity/Application";
import { Venue } from "../entity/Venue";

export class VendorStatsController {
  private applicationRepository = AppDataSource.getRepository(Application);
  private venueRepository = AppDataSource.getRepository(Venue);

  // ---------------------------------------------------------------
  // Work out the [start, end] window for the chosen time range.
  // The UI lets the vendor "zoom" by picking one of these.
  // ---------------------------------------------------------------
  private windowForRange(range: string): { start: Date; end: Date } {
    const now = new Date();

    if (range === "week") {
      // last 7 days, inclusive
      const start = new Date(now);
      start.setDate(start.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      return { start, end: new Date(8640000000000000) }; // far future
    }

    if (range === "month") {
      // this calendar month, 1st 00:00 -> far future
      const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      return { start, end: new Date(8640000000000000) };
    }

    if (range === "lastMonth") {
      // 1st of previous month -> last day of previous month
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      return { start, end };
    }

    // "all" or anything else => everything
    return { start: new Date(0), end: new Date(8640000000000000) };
  }

  // ---------------------------------------------------------------
  // GET /api/vendor/stats?range=...
  // ---------------------------------------------------------------
  async getStats(req: Request, res: Response) {
    // The vendor is whoever the JWT says it is (set by requireAuth).
    const vendorID = req.user!.id;
    const range = (req.query.range as string) || "all";
    const { start, end } = this.windowForRange(range);

    // 1. Find all venues owned by this vendor.
    const venues = await this.venueRepository.find({
      where: { vendor: { userID: vendorID } },
    });

    // 2. Find every application sent to any of those venues, with
    //    the hirer + venue joined. We filter the date window in
    //    JavaScript (the dataset is small for this assignment).
    const allApps = await this.applicationRepository.find({
      where: { venue: { vendor: { userID: vendorID } } },
      relations: { hirer: true, venue: true },
    });

    const inWindow = allApps.filter((a) => {
      if (a.status === "rejected") return false; // not a real booking
      const d = new Date(a.eventDate);
      return d >= start && d <= end;
    });

    // -----------------------------------------------------------
    // CHART 1 - Per-venue bar chart
    // For each venue we return one row containing every hirer's
    // tally. recharts will render one bar per hirer per row.
    //   [{ venue: "Federation Grand Ballroom", "Taylor Swift": 3,
    //      "Beyonce Knowles": 1 }, ...]
    // -----------------------------------------------------------
    const allHirerNames = new Set<string>();
    inWindow.forEach((a) => {
      if (a.hirer) {
        allHirerNames.add(`${a.hirer.firstName} ${a.hirer.lastName}`);
      }
    });
    const hirerNames = Array.from(allHirerNames);

    const perVenue = venues.map((venue) => {
      const row: Record<string, string | number> = { venue: venue.name };
      hirerNames.forEach((name) => {
        row[name] = inWindow.filter(
          (a) =>
            a.venue?.venueID === venue.venueID &&
            a.hirer &&
            `${a.hirer.firstName} ${a.hirer.lastName}` === name,
        ).length;
      });
      return row;
    });

    // -----------------------------------------------------------
    // CHART 2 - Stacked bar: one bar per hirer, stacked by venue
    // Shows every hirer's TOTAL bookings across all venues, split
    // by which venue they booked.
    //   [{ hirer: "Taylor Swift", "Federation": 2, "Yarra": 1 }]
    // -----------------------------------------------------------
    const stackedTotals = hirerNames.map((name) => {
      const row: Record<string, string | number> = { hirer: name };
      venues.forEach((venue) => {
        row[venue.name] = inWindow.filter(
          (a) =>
            a.hirer &&
            `${a.hirer.firstName} ${a.hirer.lastName}` === name &&
            a.venue?.venueID === venue.venueID,
        ).length;
      });
      return row;
    });

    // -----------------------------------------------------------
    // CHART 3 - Pie chart of hirer activity, plus most/least
    // -----------------------------------------------------------
    const hirerTotals = hirerNames
      .map((name) => ({
        name,
        count: inWindow.filter(
          (a) =>
            a.hirer && `${a.hirer.firstName} ${a.hirer.lastName}` === name,
        ).length,
      }))
      .filter((h) => h.count > 0) // pie slices of 0 are pointless
      .sort((a, b) => b.count - a.count);

    const mostActive = hirerTotals[0] ?? null;
    const leastActive =
      hirerTotals.length > 1 ? hirerTotals[hirerTotals.length - 1] : null;

    // -----------------------------------------------------------
    // CHART 4 - Venue utilization line chart over time
    // Group bookings by day -> [{ date: "2026-04-01", count: 3 }]
    // -----------------------------------------------------------
    const dayMap: Record<string, number> = {};
    inWindow.forEach((a) => {
      const key = new Date(a.eventDate).toISOString().split("T")[0];
      dayMap[key] = (dayMap[key] ?? 0) + 1;
    });
    const utilization = Object.entries(dayMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    res.json({
      range,
      totalBookings: inWindow.length,
      venueCount: venues.length,
      perVenue,
      hirerNames,
      venueNames: venues.map((v) => v.name),
      stackedTotals,
      hirerPieData: hirerTotals,
      mostActive,
      leastActive,
      utilization,
    });
  }
}
