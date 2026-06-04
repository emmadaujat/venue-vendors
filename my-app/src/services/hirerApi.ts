// hirerApi.ts - all hirer-side API calls.
// normaliseVenue() flattens the relational amenity/tag rows the backend sends into
// plain string arrays, and coerces decimal-as-string columns back to numbers.

import api from "@/services/api";
import type { Venue } from "@/types";

// The raw shape the backend sends for a venue (TypeORM entity).
interface RawVenue {
  venueID: number;
  name: string;
  location: string;
  capacity: number;
  pricePerDay: number | string;
  rating: number | string;
  reviewCount: number;
  shortDescription: string;
  imageURL: string;
  availabilityStatus: string;
  isFeatured?: boolean;
  vendor?: { userID: number };
  amenities?: { amenityName: string }[];
  suitabilityTags?: { suitabilityName: string }[];
}

// Turn one raw backend venue into the simple shape pages expect.
function normaliseVenue(raw: RawVenue): Venue {
  return {
    venueID: raw.venueID,
    vendorId: raw.vendor?.userID ?? 0,
    name: raw.name,
    location: raw.location,
    capacity: raw.capacity,
    pricePerDay: Number(raw.pricePerDay),
    rating: Number(raw.rating),
    reviewCount: raw.reviewCount,
    shortDescription: raw.shortDescription,
    imageURL: raw.imageURL,
    amenities: (raw.amenities ?? []).map((a) => a.amenityName),
    suitabilityTags: (raw.suitabilityTags ?? []).map((s) => s.suitabilityName),
    availabilityStatus: raw.availabilityStatus,
    isFeatured: raw.isFeatured ?? false,
  };
}

// What the apply form sends to create a booking/application.
export interface CreateBookingInput {
  venueID: number;
  eventName: string;
  eventType: string;
  eventDate: string; // "YYYY-MM-DD"
  eventEndDate?: string;
  guestCount: number;
  additionalNotes?: string;
}

export interface UpdateProfileInput {
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export const hirerApi = {
  getVenues: async (filters?: {
    search?: string;
    location?: string;
    capacity?: number;
    keyword?: string;
  }): Promise<Venue[]> => {
    const response = await api.get("/venues", { params: filters });
    return (response.data as RawVenue[]).map(normaliseVenue);
  },

  getVenueById: async (venueID: number): Promise<Venue> => {
    const response = await api.get(`/venues/${venueID}`);
    return normaliseVenue(response.data as RawVenue);
  },

  // Returns venue details plus blocked date ranges for the venue detail page.
  getVenueDetail: async (
    venueID: number,
  ): Promise<{
    venue: Venue;
    blockedDates: { startDate: string; endDate: string }[];
  }> => {
    const response = await api.get(`/venues/${venueID}`);
    const raw = response.data as RawVenue & {
      blockedDates?: { startDate: string; endDate: string }[];
    };
    return {
      venue: normaliseVenue(raw),
      blockedDates: raw.blockedDates ?? [],
    };
  },

  getVenueSuitability: async (
    venueID: number,
    eventType: string,
  ): Promise<{ matched: string[]; score: number; allTags: string[] }> => {
    const response = await api.get(`/venues/${venueID}/suitability`, {
      params: { eventType },
    });
    return response.data;
  },

  getSavedVenues: async (): Promise<
    { savedVenueID: number; rankingOrder: number; venue: Venue }[]
  > => {
    const response = await api.get("/hirer/saved");
    const rows = response.data as {
      savedVenueID: number;
      rankingOrder: number;
      venue: RawVenue;
    }[];
    return rows.map((row) => ({
      savedVenueID: row.savedVenueID,
      rankingOrder: row.rankingOrder,
      venue: normaliseVenue(row.venue),
    }));
  },

  saveVenue: async (venueID: number, rankingOrder: number) => {
    const response = await api.post("/hirer/saved", { venueID, rankingOrder });
    return response.data;
  },

  updateSavedVenueRank: async (savedVenueID: number, rankingOrder: number) => {
    const response = await api.put(`/hirer/saved/${savedVenueID}`, {
      rankingOrder,
    });
    return response.data;
  },

  deleteSavedVenue: async (savedVenueID: number) => {
    const response = await api.delete(`/hirer/saved/${savedVenueID}`);
    return response.data;
  },

  createBooking: async (input: CreateBookingInput) => {
    const response = await api.post("/bookings", input);
    return response.data;
  },

  getMyBookings: async () => {
    const response = await api.get("/hirer/bookings");
    return response.data;
  },

  getDashboard: async () => {
    const response = await api.get("/hirer/dashboard");
    return response.data;
  },

  getReputation: async () => {
    const response = await api.get("/hirer/reputation");
    return response.data;
  },

  getCompliance: async () => {
    const response = await api.get("/hirer/compliance");
    return response.data;
  },

  addCompliance: async (doc: {
    documentType: string;
    fileName: string;
    fileURL?: string;
    isBusiness?: boolean;
    abnNumber?: string;
  }) => {
    const response = await api.post("/hirer/compliance", doc);
    return response.data;
  },

  updateProfile: async (input: UpdateProfileInput) => {
    const response = await api.put("/hirer/profile", input);
    return response.data;
  },

  getPlatformStats: async (): Promise<{ totalBookings: number }> => {
    const response = await api.get("/venues/stats");
    return response.data;
  },
};
