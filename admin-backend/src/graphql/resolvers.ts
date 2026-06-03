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

    // TODO:
    // 8. get top 3 most popular venues and get their most popular day and timeslot (HD PART I. MOST POPULAR VENUE - Query - [VenueStat]!)
    topVenues: async () => {},

    // 9. Top 3 most successful applicants
    //
    // "Successful" = ratio of approved bookings to total
    // applications submitted, with a minimum of 1 application so
    // we don't divide by zero or surface noise from hirers who
    // have never applied. Ties are broken by raw approval count
    // so a hirer with 10/10 ranks above one with 1/1.
    //
    // Returns the ApplicationStat type declared in schema.ts:
    //   { userID, firstName, lastName, email, totalApplications,
    //     approvedBookings }
    topApplicants: async () => {
      // Load every hirer with their applications attached.
      const hirers = await userRepository.find({
        where: { role: "hirer" },
        relations: { applications: true },
      });

      const stats = hirers
        .map((hirer) => {
          const all = hirer.applications ?? [];
          const approved = all.filter((a) => a.status === "approved").length;
          return {
            userID: hirer.userID,
            firstName: hirer.firstName,
            lastName: hirer.lastName,
            email: hirer.email,
            totalApplications: all.length,
            approvedBookings: approved,
            // Score used only for sorting, not returned.
            _ratio: all.length === 0 ? 0 : approved / all.length,
          };
        })
        // Must have applied at least once to be considered.
        .filter((s) => s.totalApplications > 0)
        .sort((a, b) => {
          if (b._ratio !== a._ratio) return b._ratio - a._ratio;
          return b.approvedBookings - a.approvedBookings;
        })
        .slice(0, 3)
        // Strip the helper field before sending it to the client.
        .map(({ _ratio, ...stat }) => stat);

      return stats;
    },

    // Get a single venue by ID - used by ManageVenue page
    venueById: async (_: any, args: any) => {
      return await venueRepository.findOne({
        where: { venueID: parseInt(args.venueId) },
        relations: { vendor: true },
      });
    },

    // Dashboard stat cards
    dashboardStats: async () => {
      const totalVenues = await venueRepository.count();
      const totalVendors = await userRepository.count({ where: { role: "vendor" } });
      const totalHirers = await userRepository.count({ where: { role: "hirer" } });
      const totalBookings = await bookingRepository.count();

      // Calculate total avg vendor rating across all bookings
      const bookings = await bookingRepository.find();
      const avgRating =
        bookings.length > 0
          ? bookings.reduce((acc, curr) => acc + (curr.vendorRating ?? 0), 0) / bookings.length
          : 0;

      return {
        totalVenues,
        totalVendors,
        totalHirers,
        totalBookings,
        avgRating: Math.round(avgRating * 2) / 2,
      };
    },

    // Top 3 rated vendors - calculates avg vendorRating across all venues
    topRatedVendors: async () => {
      // get all vendors with their venues and bookings
      const vendors = await userRepository.find({
        where: { role: "vendor" },
        relations: { venues: { applications: { booking: true } } },
      });

      const vendorStats = vendors.map((vendor) => {
        // get all bookings for all venues and applications for this vendor
        const allBookings =
          vendor.venues?.flatMap(
            (v: any) => v.applications?.flatMap((a: any) => (a.booking ? [a.booking] : [])) ?? [],
          ) ?? [];

        const avgRating =
          allBookings.length > 0
            ? allBookings.reduce((acc: number, b: any) => acc + (b.vendorRating ?? 0), 0) /
              allBookings.length
            : 0;

        return {
          userID: vendor.userID,
          firstName: vendor.firstName,
          lastName: vendor.lastName,
          email: vendor.email,
          joinedDate: vendor.joinedDate,
          totalVenues: vendor.venues?.length ?? 0,
          totalBookings: allBookings.length,
          avgRating: Math.round(avgRating * 2) / 2,
        };
      });

      // Sort highest to lowest and return top 3
      return vendorStats.sort((a, b) => b.avgRating - a.avgRating).slice(0, 3);
    },
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
    setFeatured: async (_: any, args: any) => {
      const { venueId, featured } = args;

      // Find the venue and update its featured status
      const venue = await venueRepository.findOne({
        where: { venueID: parseInt(venueId) },
        relations: { vendor: true },
      });

      if (!venue) throw new Error("Venue not found");

      // update featured status on venue and return
      venue.isFeatured = featured;
      return await venueRepository.save(venue);
    },

    // 3. reassign venue vendor (HD PART H. SWAP VENDORS - mutation - (venueId: ID!, vendorId: ID!))
    assignVendor: async (_: any, args: any) => {
      const { venueId, vendorId } = args;

      // Find the venue
      const venue = await venueRepository.findOne({
        where: { venueID: parseInt(venueId) },
        relations: { vendor: true },
      });

      if (!venue) throw new Error("Venue not found");

      // Find the vendor
      const vendor = await userRepository.findOne({
        where: { userID: parseInt(vendorId), role: "vendor" },
      });

      if (!vendor) throw new Error("Vendor not found");

      try {
        // Assign the new vendor to the venue
        venue.vendor = vendor;
        await venueRepository.save(venue);

        // Return updated venue with new vendor relation
        return await venueRepository.findOne({
          where: { venueID: parseInt(venueId) },
          relations: { vendor: true },
        });
      } catch (error) {
        throw new Error("Error assigning vendor. Please try again.");
      }
    },

    // 6. create a venue (HD PART H. "C" CRUD - mutation - (input: VenueInput!))
    createVenue: async (_: any, args: any) => {
      const { input } = args;
      const {
        name,
        location,
        capacity,
        pricePerDay,
        shortDescription,
        imageURL,
        availabilityStatus,
        amenities,
        suitabilityTags,
        isFeatured,
        vendorId,
      } = input;

      // Check if a venue with the same name and location already exists
      const existingVenue = await venueRepository.findOne({
        where: { name, location },
      });

      if (existingVenue) {
        throw new Error("A venue with this name and location already exists.");
      }

      try {
        // Create and save the venue first
        const newVenue = venueRepository.create({
          name,
          location,
          capacity,
          pricePerDay,
          shortDescription,
          imageURL,
          availabilityStatus,
          isFeatured: isFeatured ?? false,
          rating: 0,
          reviewCount: 0,
          vendor: { userID: parseInt(vendorId) },
        });

        const savedVenue = await venueRepository.save(newVenue);

        // Insert amenities if provided
        if (amenities && amenities.length > 0) {
          const newAmenities = amenities.map((amenityName: string) =>
            venueAmenitiesRepository.create({
              amenityName,
              venue: { venueID: savedVenue.venueID },
            }),
          );
          await venueAmenitiesRepository.save(newAmenities);
        }

        // Insert suitability tags if provided
        if (suitabilityTags && suitabilityTags.length > 0) {
          const newTags = suitabilityTags.map((suitabilityName: string) =>
            venueSuitabilityTagRepository.create({
              suitabilityName,
              venue: { venueID: savedVenue.venueID },
            }),
          );
          await venueSuitabilityTagRepository.save(newTags);
        }

        // Return the created venue with vendor relation
        return await venueRepository.findOne({
          where: { venueID: savedVenue.venueID },
          relations: { vendor: true },
        });
      } catch (error) {
        throw new Error("Error creating venue. Please try again.");
      }
    },

    // 4. update venue details (HD PART H. "U" CRUD - mutation - (venueId: ID!, input: VenueInput!))
    updateVenue: async (_: any, args: any) => {
      const { venueId, input } = args;
      const {
        name,
        location,
        capacity,
        pricePerDay,
        shortDescription,
        imageURL,
        availabilityStatus,
        amenities,
        suitabilityTags,
        isFeatured,
      } = input;

      // Find the venue
      const venue = await venueRepository.findOne({
        where: { venueID: parseInt(venueId) },
        relations: { vendor: true },
      });

      if (!venue) throw new Error("Venue not found");

      // Update main venue fields
      venue.name = name;
      venue.location = location;
      venue.capacity = capacity;
      venue.pricePerDay = pricePerDay;
      venue.shortDescription = shortDescription;
      venue.imageURL = imageURL;
      venue.availabilityStatus = availabilityStatus;
      venue.isFeatured = isFeatured ?? venue.isFeatured;

      try {
        // Save updated venue fields
        await venueRepository.save(venue);

        // Delete old amenities and suitability tags then reinsert new ones
        await venueAmenitiesRepository.delete({ venue: { venueID: parseInt(venueId) } });
        await venueSuitabilityTagRepository.delete({ venue: { venueID: parseInt(venueId) } });

        // Insert new amenities
        if (amenities && amenities.length > 0) {
          const newAmenities = amenities.map((amenityName: string) =>
            venueAmenitiesRepository.create({ amenityName, venue: { venueID: parseInt(venueId) } }),
          );
          await venueAmenitiesRepository.save(newAmenities);
        }

        // Insert new suitability tags
        if (suitabilityTags && suitabilityTags.length > 0) {
          const newTags = suitabilityTags.map((suitabilityName: string) =>
            venueSuitabilityTagRepository.create({
              suitabilityName,
              venue: { venueID: parseInt(venueId) },
            }),
          );
          await venueSuitabilityTagRepository.save(newTags);
        }

        // Return updated venue with vendor relation
        return await venueRepository.findOne({
          where: { venueID: parseInt(venueId) },
          relations: { vendor: true },
        });
      } catch (error) {
        throw new Error("Error updating venue. Please try again.");
      }
    },

    // 5. delete venue (HD PART H. "D" CRUD - mutation - (venueId: ID!))
    deleteVenue: async (_: any, args: any) => {
      const { venueId } = args;

      // Find venue
      const venue = await venueRepository.findOne({
        where: { venueID: parseInt(venueId) },
        relations: { vendor: true },
      });

      if (!venue) throw new Error("Venue not found");

      try {
        await venueRepository.remove(venue);
        return true;
      } catch (error) {
        throw new Error("Error deleting venue. Please try again.");
      }
    },
  },
  // Fetch related amenities and suitability tags
  Venue: {
    amenities: async (parent: any) => {
      const amenities = await venueAmenitiesRepository.find({
        where: { venue: { venueID: parent.venueID } },
      });
      return amenities.map((a) => a.amenityName);
    },
    suitabilityTags: async (parent: any) => {
      const suitabilityTags = await venueSuitabilityTagRepository.find({
        where: { venue: { venueID: parent.venueID } },
      });
      return suitabilityTags.map((t) => t.suitabilityName);
    },
  },
};
