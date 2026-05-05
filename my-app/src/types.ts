// types used across the app

// user who signed up - can be hirer or vendor
export type User = {
    id: string;
    email: string;
    password: string;
    role: string;
    firstName: string;
    lastName: string;
    phone: string;
};

// venue that a vendor has listed
export type Venue = {
    id: string;
    vendorId: string;
    name: string;
    location: string;
    capacity: number;
    pricePerDay: number;
    rating: number;
    reviewCount: number;
    shortDescription: string;
    imageUrl: string;
    amenities: string[];
    suitabilityTags: string[]; // e.g. Corporate, Wedding, Conference, Gala Dinner
    availabilityStatus: string;
};

// booking record for a hirer
export type Booking = {
    id: string;
    hirerId: string;
    venueId: string;
    venueName: string;
    venueLocation: string;
    eventName: string;
    eventDate: string;
    vendorRating: number; // 0 means not rated yet
    status: string;
};

// application from a hirer to hire a venue
export type Application = {
    id: string;
    hirerId: string;
    venueId: string;
    venueName: string;
    eventName: string;
    eventType: string;
    eventDate: string;
    guestCount: number;
    additionalNotes: string;
    reputationTags: string[];
    status: string;
    submittedAt: string;
};

// vendor feedback on a hirer
export type VendorComment = {
    id: string;
    vendorId: string;
    hirerId: string;
    hirerName: string;
    commentText: string;
    credibilityTag: string;
    date: string;
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
