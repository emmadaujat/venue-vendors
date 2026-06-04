import gql from "graphql-tag";

export const typeDefs = gql`
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

  type DashboardStats {
    totalVenues: Int!
    totalVendors: Int!
    totalHirers: Int!
    totalBookings: Int!
    avgRating: Float!
  }

  type AuthPayload {
    token: String!
  }

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

  type Query {
    venues: [Venue!]!
    venueById(venueId: ID!): Venue
    vendors: [User!]!
    dashboardStats: DashboardStats!
    topVenues: [VenueStat!]!
    topApplicants: [ApplicationStat!]!
    topRatedVendors: [VendorStat!]!
  }

  type Mutation {
    # Hardcoded credentials per spec (admin/admin).
    adminLogin(username: String!, password: String!): AuthPayload!

    assignVendor(venueId: ID!, vendorId: ID!): Venue!

    createVenue(input: VenueInput!): Venue!
    updateVenue(venueId: ID!, input: VenueInput!): Venue!
    deleteVenue(venueId: ID!): Boolean!

    setFeatured(venueId: ID!, featured: Boolean!): Venue!
  }
`;
