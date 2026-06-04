import gql from "graphql-tag";

export const typeDefs = gql`
  # --------------------
  # ---- Core Types ----
  # --------------------

  type User {
    userID: ID!
    firstName: String!
    lastName: String!
    email: String!
    phoneNumber: String
    role: String!
    joinedDate: String
  }

  type Venue {
    venueID: ID!
    name: String!
    location: String!
    capacity: Int!
    pricePerDay: Float!
    shortDescription: String
    imageURL: String
    availabilityStatus: String
    isFeatured: Boolean!
    vendor: User
    # Amenities and suitability tags needed by frontend forms
    amenities: [String!]!
    suitabilityTags: [String!]!
  }

  type VendorStat {
    userID: ID!
    firstName: String!
    lastName: String!
    email: String!
    joinedDate: String
    totalVenues: Int!
    totalBookings: Int!
    avgRating: Float!
  }

  # ----------------------
  # ---- Report Types ----
  # ----------------------

  type VenueStat {
    venueID: ID!
    name: String!
    location: String!
    totalApplications: Int!
    mostPopularDay: String
    mostPopularTimeslot: String
    vendorName: String
    vendorEmail: String
  }

  type ApplicationStat {
    userID: ID!
    firstName: String!
    lastName: String!
    email: String!
    totalApplications: Int!
    approvedBookings: Int!
    joinedDate: String
  }

  # --------------------------
  # ---- Dashboard Stats -----
  # --------------------------

  type DashboardStats {
    totalVenues: Int!
    totalVendors: Int!
    totalHirers: Int!
    totalBookings: Int!
    avgRating: Float!
  }

  # ---------------
  # ---- Auth ----
  # ---------------

  type AuthPayload {
    token: String! #--- returns a token string on successful admin login
  }

  # ---------------------
  # ---- Input Types ----
  # ---------------------

  input VenueInput {
    name: String!
    location: String!
    capacity: Int!
    pricePerDay: Float!
    shortDescription: String
    imageURL: String
    availabilityStatus: String
    isFeatured: Boolean
    amenities: [String!]
    suitabilityTags: [String!]
    vendorId: ID
  }

  # -----------------
  # ---- Queries ----
  # -----------------

  type Query {
    # Get all venues with their assigned vendor (resolver.ts step 1)
    venues: [Venue!]!

    # Get a single venue by ID — used by ManageVenue page
    venueById(venueId: ID!): Venue

    # Get all users with vendor role (resolver.ts step 2)
    vendors: [User!]!

    # Dashboard stat cards — total venues, vendors, hirers, bookings, avg rating
    dashboardStats: DashboardStats!

    # Top 3 most popular venues with most popular day and timeslot (resolver.ts step 8)
    topVenues: [VenueStat!]!

    # Top 3 most active applicants (resolver.ts step 9)
    topApplicants: [ApplicationStat!]!

    # Get top rated vendors
    topRatedVendors: [VendorStat!]!
  }

  # -------------------
  # ---- Mutations ----
  # -------------------

  type Mutation {
    # Admin login — hardcoded credentials per spec (admin/admin)  (resolver.ts step 10)
    adminLogin(username: String!, password: String!): AuthPayload!

    # Assign or swap a vendor to a venue (resolver.ts step 3)
    assignVendor(venueId: ID!, vendorId: ID!): Venue!

    # CRUD on venues (resolver.ts step 4-6)
    createVenue(input: VenueInput!): Venue!
    updateVenue(venueId: ID!, input: VenueInput!): Venue!
    deleteVenue(venueId: ID!): Boolean!

    # Toggle featured status on hirer browse page (resolver.ts step 7)
    setFeatured(venueId: ID!, featured: Boolean!): Venue!
  }
`;
