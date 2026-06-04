// HD Test 4 - GET /api/vendor/stats with an empty vendor
// A brand-new vendor (no venues, no applications) is the most common first-run state.
// If the stats endpoint assumes at least one venue or booking exists, aggregate
// calculations over empty arrays can throw, returning a 500 that breaks the Infographic
// Report page. This test pins the contract: an empty vendor gets 200 with zeroed/empty
// data, never a 500, so the page can show its "No booking activity" state instead of crashing.
//
// jest.mock replaces AppDataSource with a stub whose repos return empty arrays (no live DB).
// supertest fires through the real Express middleware chain including requireAuth and requireRole.

// JWT_SECRET must be set before utils/jwt is imported (requireAuth verifies tokens with it).
process.env.JWT_SECRET = "test-secret-for-hd-tests";

// Shared mock repository; both venueRepository.find() and applicationRepository.find()
// resolve to an empty list, modelling a vendor with no activity.
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
    const token = signToken({ id: 99, role: "vendor", email: "newvendor@example.com" });

    const res = await request(app)
      .get("/api/vendor/stats?range=week")
      .set("Authorization", `Bearer ${token}`);

    // Empty aggregates must not crash the endpoint.
    expect(res.status).toBe(200);
    expect(res.body.totalBookings).toBe(0);
    expect(res.body.venueCount).toBe(0);

    // Every chart dataset is an empty array with no active hirer to highlight.
    expect(res.body.perVenue).toEqual([]);
    expect(res.body.hirerPieData).toEqual([]);
    expect(res.body.utilization).toEqual([]);
    expect(res.body.mostActive).toBeNull();
    expect(res.body.leastActive).toBeNull();
  });
});
