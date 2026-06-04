// ===========================================================
// HD Tests 5 & 6 - venue.crud.test.ts  (Emma — admin GraphQL CRUD)
// ===========================================================
// These are the TWO contextual unit tests that live in the
// /admin-backend (GraphQL) app, as agreed with the tutor:
//   * 4 tests in the REST /backend
//   * 2 tests here covering the admin Venue CRUD resolvers
//
// They call the GraphQL resolver functions directly (the same
// functions Apollo Server runs for the createVenue / deleteVenue
// mutations) so we test the real admin logic without needing a
// running Apollo HTTP server.
//
// jest.mock replaces AppDataSource with an in-memory stub so the
// tests never touch the live MS SQL database. reflect-metadata is
// imported first because the TypeORM entity files use decorators.
// ===========================================================

import "reflect-metadata";

// JWT secret is set in case anything in the resolver chain reads it
// (adminLogin signs a token); the CRUD tests below don't need a token.
process.env.JWT_SECRET = "test-secret-for-hd-tests";

// One shared mock repository. resolvers.ts builds several
// repositories (venue, amenities, suitability...) from
// AppDataSource.getRepository — they all resolve to this same stub,
// and each test arms only the methods it needs.
const mockRepo = {
  find: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  create: jest.fn((data: unknown) => data),
  save: jest.fn(),
  remove: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
};

jest.mock("../data-source", () => ({
  AppDataSource: {
    getRepository: jest.fn(() => mockRepo),
  },
}));

import { resolvers } from "../graphql/resolvers";

describe("admin venue CRUD resolvers", () => {
  beforeEach(() => {
    mockRepo.findOne.mockReset();
    mockRepo.save.mockReset();
    mockRepo.remove.mockReset();
    mockRepo.create.mockClear();
  });

  // ---------------------------------------------------------------
  // HD Test 5 — CREATE guard (the "C" in CRUD)
  // ---------------------------------------------------------------
  // CONTEXT: an admin can add venues from the dashboard. If two
  // venues share the exact same name AND location they are almost
  // certainly a duplicate entry (a double-click or a re-submit),
  // which would split that venue's bookings across two rows and
  // corrupt every "top venues" report. The createVenue resolver
  // must refuse the duplicate BEFORE writing anything to the DB.
  // ---------------------------------------------------------------
  test("createVenue refuses a duplicate (same name + location) and does not save", async () => {
    // The duplicate check is the resolver's first DB call: pretend a
    // venue with this name+location already exists.
    mockRepo.findOne.mockResolvedValueOnce({
      venueID: 1,
      name: "Federation Grand Ballroom",
      location: "Melbourne CBD",
    });

    const input = {
      name: "Federation Grand Ballroom",
      location: "Melbourne CBD",
      capacity: 200,
      pricePerDay: 1500,
      vendorId: "3",
    };

    // The resolver must reject with the exact duplicate message...
    await expect(resolvers.Mutation.createVenue(null, { input })).rejects.toThrow(
      "A venue with this name and location already exists.",
    );

    // ...and crucially must NOT have written the duplicate.
    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  // ---------------------------------------------------------------
  // HD Test 6 — DELETE happy path (the "D" in CRUD)
  // ---------------------------------------------------------------
  // CONTEXT: when an admin deletes an existing venue the resolver
  // must actually remove it and report success (true) so the UI can
  // drop the row. This pins down that deleteVenue looks the venue up,
  // calls remove() exactly once, and returns true.
  // ---------------------------------------------------------------
  test("deleteVenue removes an existing venue and returns true", async () => {
    const existingVenue = {
      venueID: 7,
      name: "Yarra Valley Harvest Estate",
      location: "Yarra Valley",
    };

    mockRepo.findOne.mockResolvedValueOnce(existingVenue);
    mockRepo.remove.mockResolvedValueOnce(existingVenue);

    const result = await resolvers.Mutation.deleteVenue(null, { venueId: "7" });

    // Returns true on success...
    expect(result).toBe(true);
    // ...and removed exactly the venue it looked up, once.
    expect(mockRepo.remove).toHaveBeenCalledTimes(1);
    expect(mockRepo.remove).toHaveBeenCalledWith(existingVenue);
  });
});
