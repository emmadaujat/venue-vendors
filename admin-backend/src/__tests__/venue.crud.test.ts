// HD Tests 5 & 6 - admin GraphQL venue CRUD resolvers
// These tests call the resolver functions directly (the same functions Apollo Server
// invokes for createVenue / deleteVenue mutations), so no running HTTP server is needed.
// jest.mock replaces AppDataSource with an in-memory stub; the tests never touch the
// live database. reflect-metadata is imported first because TypeORM entity files use decorators.

import "reflect-metadata";

process.env.JWT_SECRET = "test-secret-for-hd-tests";

// One shared mock repository; each test arms only the methods it needs.
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

  // HD Test 5 - CREATE duplicate guard
  // Two venues with the same name and location are almost certainly a double-submit.
  // The resolver must refuse the duplicate before writing to the DB, preventing split
  // booking records that would corrupt "top venues" reports.
  test("createVenue refuses a duplicate (same name + location) and does not save", async () => {
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

    await expect(resolvers.Mutation.createVenue(null, { input })).rejects.toThrow(
      "A venue with this name and location already exists.",
    );

    // Must not write the duplicate to the DB.
    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  // HD Test 6 - DELETE happy path
  // When an admin deletes an existing venue, the resolver must remove it and return true.
  test("deleteVenue removes an existing venue and returns true", async () => {
    const existingVenue = {
      venueID: 7,
      name: "Yarra Valley Harvest Estate",
      location: "Yarra Valley",
    };

    mockRepo.findOne.mockResolvedValueOnce(existingVenue);
    mockRepo.remove.mockResolvedValueOnce(existingVenue);

    const result = await resolvers.Mutation.deleteVenue(null, { venueId: "7" });

    expect(result).toBe(true);
    // remove() must be called exactly once with the retrieved venue object.
    expect(mockRepo.remove).toHaveBeenCalledTimes(1);
    expect(mockRepo.remove).toHaveBeenCalledWith(existingVenue);
  });
});
