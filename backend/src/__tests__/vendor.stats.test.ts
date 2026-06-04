// ===========================================================
// HD Test 4 - vendor.stats.test.ts  (Emma — vendor side)
// ===========================================================
// CONTEXT (the "contextual" comment block the spec asks for):
// the vendor Infographic Report page calls GET /api/vendor/stats
// the moment it loads. A brand-new vendor who owns no venues and
// has received no applications is the most common real first-run
// state. If the stats endpoint assumes there is always at least
// one venue/booking, the aggregate maths (most-active hirer,
// utilization-by-day, etc.) runs over empty arrays and can throw,
// returning a 500 that makes the whole page look broken (this is
// exactly the "page won't open" symptom we want to prevent).
//
// This test pins down the safe contract: an empty vendor gets a
// normal 200 with zeroed/empty data — NOT a 500 — so the page can
// render its friendly "No booking activity" empty-state instead
// of crashing.
//
// jest.mock replaces AppDataSource with an in-memory stub whose
// repositories return empty arrays, so the test needs no live SQL
// Server. supertest fires the request through the real Express
// middleware chain (cors -> json -> requireAuth ->
// requireRole("vendor") -> vendorStatsController.getStats).
// ===========================================================

// JWT_SECRET must be set BEFORE utils/jwt is imported (requireAuth
// verifies the token with it).
process.env.JWT_SECRET = "test-secret-for-hd-tests";

// A shared mock repository. Every entity's getRepository() returns
// this same object; here both venueRepository.find() and
// applicationRepository.find() resolve to an empty list, modelling
// a vendor with nothing yet.
const mockRepo = {
  find: jest.fn().mockResolvedValue([]),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  save: jest.fn(),
  create: jest.fn((data: unknown) => data),
  count: jest.fn(),
};

jest.mock("../data-source", () => ({
  AppDataSource: {
    getRepository: jest.fn(() => mockRepo),
  },
}));

import request from "supertest";
import app from "../app";
import { signToken } from "../utils/jwt";

describe("GET /api/vendor/stats - empty vendor edge case", () => {
  test("returns 200 with zeroed/empty data (never a 500) for a vendor with no activity", async () => {
    // A real signed JWT for a vendor — requireRole("vendor") needs it.
    const token = signToken({ id: 99, role: "vendor", email: "newvendor@example.com" });

    const res = await request(app)
      .get("/api/vendor/stats?range=week")
      .set("Authorization", `Bearer ${token}`);

    // The whole point: empty aggregates must NOT crash the endpoint.
    expect(res.status).toBe(200);

    // Counts are zero...
    expect(res.body.totalBookings).toBe(0);
    expect(res.body.venueCount).toBe(0);

    // ...and every chart dataset is an empty array, with no
    // most/least-active hirer to highlight.
    expect(res.body.perVenue).toEqual([]);
    expect(res.body.hirerPieData).toEqual([]);
    expect(res.body.utilization).toEqual([]);
    expect(res.body.mostActive).toBeNull();
    expect(res.body.leastActive).toBeNull();
  });
});
