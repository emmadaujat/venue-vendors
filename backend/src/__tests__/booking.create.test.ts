// ===========================================================
// HD Test 2 - booking.create.test.ts
// ===========================================================
// CONTEXT (this is the "contextual" comment block the spec asks
// for): a vendor can block a venue's date for maintenance or a
// private hold. The frontend reads those blocks once when the
// detail page loads, so there is a race-condition window in
// which a hirer's browser still shows a blocked date as
// available. If the API does not re-check the block at submit
// time, two hirers can confirm "the same" date and the vendor
// is left with a contract dispute.
//
// This test pins down that the API refuses a booking whose
// `eventDate` falls inside any of the venue's blocked ranges,
// with the exact response shape the React side relies on
// (status 409, message "timeslot blocked").
//
// jest.mock replaces AppDataSource with an in-memory stub so
// the test does not need a live SQL Server. supertest fires
// the request through the real Express middleware chain (cors
// -> json -> requireAuth -> requireRole("hirer") -> validateDto
// -> bookingController.createBooking).
// ===========================================================

// JWT_SECRET must be set BEFORE utils/jwt is imported.
process.env.JWT_SECRET = "test-secret-for-hd-tests";

// Shared mock repo - any entity returns this same object, but
// each test re-arms `findOne` / `save` with what it needs.
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
    // Choose a date far in the future to make sure the
    // controller's "past date" guard does NOT trip instead.
    const blockedDate = "2099-12-25";

    // The bookingController calls venueRepository.findOne first;
    // serve it a venue that explicitly blocks the date we will
    // ask for.
    mockRepo.findOne.mockResolvedValueOnce({
      venueID: 5,
      capacity: 100,
      blockedDates: [{ startDate: blockedDate, endDate: blockedDate }],
    });

    // requireAuth needs a real signed JWT for a hirer.
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

    // The exact contract the React side relies on.
    expect(res.status).toBe(409);
    expect(res.body.message).toBe("timeslot blocked");

    // And the controller MUST NOT have tried to write to the DB.
    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  test("creates the application (201) when the date is NOT blocked", async () => {
    // Sanity check: the same flow with a clear date should
    // succeed, proving the 409 above is specifically because of
    // the block, not because every request is rejected.
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
