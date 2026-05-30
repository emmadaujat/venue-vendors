// 1. retreieve venues with their assigned vendor (HD PART H. "R" CRUD - Query)
// 2. get all vendors that exist in the database (Query)
// 3. reassign venues (HD PART H. SWAP VENDORS - mutation)
// 4. update venue details (HD PART H. "U" CRUD - mutation)
// 5. delete venue (HD PART H. "D" CRUD - mutation)
// 6. create a venue (HD PART H. "C" CRUD - mutation)
// 7. add or remove venues to featured venues section (HD PART H. FEATURED VENUE - mutation)
// 8. get top 3 most popular venues and get their most popular day and timeslot (HD PART I. MOST POPULAR VENUE - Query)
// 9. get top 3 most active applicants (successful bookings / number of bookings submitted (HD PART I. MOST SUCCESSFUL APPLICANT - Query)
// 10. Admin login

import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import { Venue } from "../entity/Venue";
import { VenueAmenities } from "../entity/VenueAmenities";
import { VenueSuitabilityTag } from "../entity/VenueSuitabilityTag";
import { Application } from "../entity/Application";
import { Booking } from "../entity/Booking";

import { signToken } from "../utils/jwt";

const userRepository = AppDataSource.getRepository(User);
const venueRepository = AppDataSource.getRepository(Venue);
const applicationRepository = AppDataSource.getRepository(Application);
const bookingRepository = AppDataSource.getRepository(Booking);
const venueAmenitiesRepository = AppDataSource.getRepository(VenueAmenities);
const venueSuitabilityTagRepository = AppDataSource.getRepository(VenueSuitabilityTag);

export const resolvers = {
  Query: {
    // 1. retreieve venues  (HD PART H. "R" CRUD - Query - [Venue]!)
    venues: async () => {
      return await venueRepository.find({
        relations: { vendor: true },
      });
    },

    // 2. get all vendors that exist in the database (Query - [User]!)
    vendors: async () => {
      return await userRepository.find({
        where: { role: "vendor" },
      });
    },

    // 8. get top 3 most popular venues and get their most popular day and timeslot (HD PART I. MOST POPULAR VENUE - Query - [VenueStat]!)
    topVenues: async () => {},

    // 9. get top 3 most active applicants (successful bookings / number of bookings submitted (HD PART I. MOST SUCCESSFUL APPLICANT - Query - [ApplicationStat]!)
    topApplicants: async () => {},
  },

  Mutation: {
    // 10. Admin login ( username: String!, password: String!)
    adminLogin: async (_: any, args: any) => {
      const { username, password } = args;

      // Hardcoded credentials as per assignment spec (admin/admin)
      if (username !== "admin" || password != "admin") {
        throw new Error("Invalid credentials");
      }

      // Sign a JWT token with admin role
      const token = signToken({ id: 0, role: "admin" });
      return { token };
    },

    // 7. add or remove venues to featured venues section (HD PART H. FEATURED VENUE - mutation - (venueId: ID!, featured: Boolean!))
    setFeatured: async (_: any, args: any) => {},

    // 3. reassign venues (HD PART H. SWAP VENDORS - mutation - (venueId: ID!, vendorId: ID!))
    assignVendor: async (_: any, args: any) => {},

    // 6. create a venue (HD PART H. "C" CRUD - mutation - (input: VenueInput!))
    createVenue: async (_: any, args: any) => {},

    // 4. update venue details (HD PART H. "U" CRUD - mutation - (venueId: ID!, input: VenueInput!))
    updateVenue: async (_: any, args: any) => {},

    // 5. delete venue (HD PART H. "D" CRUD - mutation - (venueId: ID!))
    deleteVenue: async (_: any, args: any) => {},
  },
};
