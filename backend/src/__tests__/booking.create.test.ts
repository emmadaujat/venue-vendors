// HD Test 2 - POST /api/bookings rejects bookings on blocked dates
// A vendor can block venue dates for maintenance or private events. The frontend reads
// those blocks when the page loads, creating a race window where a hirer's browser may
// show a blocked date as available. If the API does not re-check at submit time, two
// hirers can confirm the same slot, causing a contract dispute.
// This test pins the contract: the API returns 409 "timeslot blocked" when eventDate falls
// inside a blocked range, and does not write to the database.
//
// jest.mock replaces AppDataSource with an in-memory stub (no live DB needed).
// supertest fires through the full Express middleware chain including requireAuth and validateDto.

// JWT_SECRET must be set before utils/jwt is imported.
process.env.JWT_SECRET = "test-secret-for-hd-tests";

// Shared mock repository; each test re-arms findOne / save with what it needs.
const mockRepo = {
  findOne: jest.fn(),
  find: jest.fn(),
  findOneBy: jest.fn(),
  save: jest.fn(),
  create: jest.fn((data: unknown) => data),
  count: jest.fn(),
  merge: jest.fn(),
  remove: jest.fn(),
};

jest.mock("../data-source", () => ({
  AppDataSource: {
    getRepository: jest.fn(() => mockRepo),
  },
}));

import request from "supertest";
import app from "../app";
import { signToken } from "../utils/jwt";

describe("POST /api/bookings - blocked timeslot guard", () => {
  beforeEach(() => {
    mockRepo.findOne.mockReset();
    mockRepo.save.mockReset();
    mockRepo.create.mockClear();
  });

  test("returns 409 with 'timeslot blocked' when the date is inside a blocked range", async () => {
    // Far-future date to avoid tripping the "past date" guard before the block check.
    const blockedDate = "2099-12-25";

    mockRepo.findOne.mockResolvedValueOnce({
      venueID: 5,
      capacity: 100,
      blockedDates: [{ startDate: blockedDate, endDate: blockedDate }],
    });

    const token = signToken({ id: 1, role: "hirer", email: "hirer@example.com" });

    const res = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${token}`)
      .send({
        venueID: 5,
        eventName: "Christmas Eve Party",
        eventType: "Wedding",
        eventDate: blockedDate,
        guestCount: 50,
      });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe("timeslot blocked");
    // The controller must not write to the DB when the date is blocked.
    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  test("creates the application (201) when the date is NOT blocked", async () => {
    // Same flow with a clear date must succeed, confirming the 409 above is specific to blocked dates.
    const clearDate = "2099-06-15";

    mockRepo.findOne.mockResolvedValueOnce({
      venueID: 5,
      capacity: 100,
      blockedDates: [{ startDate: "2099-12-25", endDate: "2099-12-25" }],
    });
    mockRepo.save.mockResolvedValueOnce({
      applicationID: 42,
      status: "pending",
    });

    const token = signToken({ id: 1, role: "hirer", email: "hirer@example.com" });

    const res = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${token}`)
      .send({
        venueID: 5,
        eventName: "Summer Conference",
        eventType: "Conference",
        eventDate: clearDate,
        guestCount: 50,
      });

    expect(res.status).toBe(201);
    expect(mockRepo.save).toHaveBeenCalledTimes(1);
  });
});
