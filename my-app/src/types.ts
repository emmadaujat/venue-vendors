// types used across the app

// user who signed up - can be hirer or vendor
export type User = {
  id: number;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  joinedDate?: string;
  displayName?: string;
};

// venue that a vendor has listed
export type Venue = {
  venueID: number;
  vendorId: number;
  name: string;
  location: string;
  capacity: number;
  pricePerDay: number;
  rating: number;
  reviewCount: number;
  shortDescription: string;
  imageURL: string;
  amenities: string[];
  suitabilityTags: string[]; // e.g. Corporate, Wedding, Conference, Gala Dinner
  availabilityStatus: string;
};

// booking record for a hirer
export type Booking = {
  bookingID: number;
  vendorRating: number; // 0 means not rated yet
  status: string;
  createdAt: string;
  application: {
    applicationID: number;
    eventName: string;
    eventType: string;
    eventDate: string;
    guestCount: number;
    additionalNotes: string;
    status: string;
    submittedAt: string;
    venue: {
      venueID: number;
      name: string;
      location: string;
      pricePerDay: number;
    };
    hirer: {
      userID: number;
      firstName: string;
      lastName: string;
      phoneNumber: string;
      dateJoined: string;
      email: string;
    };
  };
  vendorComments: {
    commentID: number;
    commentText: string;
    credibilityTag: string;
    dateAdded: string;
  }[];
};

// application from a hirer to hire a venue
export type Application = {
  applicationID: number;
  hirer: {
    userID: number;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    dateJoined: string;
    email: string;
  };
  venue: { venueID: number; name: string; location: string };
  eventName: string;
  eventType: string;
  eventDate: string;
  guestCount: number;
  additionalNotes: string;
  reputationTags: { reputationID: number; reputationName: string }[];
  status: string;
  submittedAt: string;
};

// vendor feedback on a hirer
export type VendorComment = {
  commentID: number;
  commentText: string;
  credibilityTag: string;
  dateAdded: string;
  booking: {
    bookingID: number;
    status: string;
    createdAt: string;
    application: {
      applicationID: number;
      eventName: string;
      eventType: string;
      eventDate: string;
      guestCount: number;
      additionalNotes: string;
      status: string;
      submittedAt: string;
      venue: {
        venueID: number;
        name: string;
        location: string;
        pricePerDay: number;
      };
      hirer: {
        userID: number;
        firstName: string;
        lastName: string;
        phoneNumber: string;
        dateJoined: string;
        email: string;
      };
    };
  };
};

// uploaded compliance doc from a hirer
export type ComplianceDocument = {
  id: string;
  hirerId: string;
  documentType: string;
  fileName: string;
  uploadedAt: string;
  isVerified: boolean;
};
