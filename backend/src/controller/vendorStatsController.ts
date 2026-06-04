// vendorStatsController.ts - powers the vendor Infographic Report page.
// GET /api/vendor/stats?range=week|month|lastMonth|all
// Returns data for four charts: hirer tallies per venue, stacked totals, hirer activity
// pie, and venue utilization over time. Rejected applications are excluded.

import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Application } from "../entity/Application";
import { Venue } from "../entity/Venue";

export class VendorStatsController {
  private applicationRepository = AppDataSource.getRepository(Application);
  private venueRepository = AppDataSource.getRepository(Venue);

  // Converts the range query param to a [start, end] date window.
  private windowForRange(range: string): { start: Date; end: Date } {
    const now = new Date();

    if (range === "week") {
      const start = new Date(now);
      start.setDate(start.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      return { start, end: new Date(8640000000000000) };
    }

    if (range === "month") {
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

  async getStats(req: Request, res: Response) {
    const vendorID = req.user!.id;
    const range = (req.query.range as string) || "all";
    const { start, end } = this.windowForRange(range);

    const venues = await this.venueRepository.find({
      where: { vendor: { userID: vendorID } },
    });

    const allApps = await this.applicationRepository.find({
      where: { venue: { vendor: { userID: vendorID } } },
      relations: { hirer: true, venue: true },
    });

    const inWindow = allApps.filter((a) => {
      if (a.status === "rejected") return false;
      const d = new Date(a.eventDate);
      return d >= start && d <= end;
    });

    // Chart 1: per-venue bar chart. One row per venue, one key per hirer name.
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

    // Chart 2: stacked bar. One bar per hirer, stacked by venue.
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

    // Chart 3: pie chart of hirer activity with most/least active.
    const hirerTotals = hirerNames
      .map((name) => ({
        name,
        count: inWindow.filter(
          (a) =>
            a.hirer && `${a.hirer.firstName} ${a.hirer.lastName}` === name,
        ).length,
      }))
      .filter((h) => h.count > 0)
      .sort((a, b) => b.count - a.count);

    const mostActive = hirerTotals[0] ?? null;
    const leastActive =
      hirerTotals.length > 1 ? hirerTotals[hirerTotals.length - 1] : null;

    // Chart 4: utilization line chart. Bookings grouped by day.
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
