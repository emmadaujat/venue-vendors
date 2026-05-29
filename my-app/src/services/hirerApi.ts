// ===========================================================
// hirerApi.ts - all the HIRER API calls in one place
// ===========================================================
// Every hirer page imports from here instead of calling axios
// directly. It uses the shared `api` instance (services/api.ts)
// which already adds the JWT "Authorization: Bearer ..." header,
// so these functions never have to think about auth.
//
// The backend stores a venue's amenities and suitability tags as
// rows in separate tables, so they arrive as arrays of objects
// like [{ amenityName: "WiFi" }]. The frontend pages were written
// to use plain string arrays, so normaliseVenue() flattens them
// and turns the SQL "decimal" columns (which arrive as strings)
// back into real numbers. One small mapper here keeps every page
// simple.
// ===========================================================

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
  // ---- Public venue browsing -------------------------------------
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

  // Like getVenueById but also returns the vendor's blocked date
  // ranges, so the venue detail page can grey them out on its
  // calendar (and the booking will be refused server-side too).
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

  // ---- Saved venues ---------------------------------------------
  // Returns the hirer's saved venues already sorted by rank, with
  // each venue normalised into the simple Venue shape.
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

  // ---- Bookings / applications ----------------------------------
  createBooking: async (input: CreateBookingInput) => {
    const response = await api.post("/bookings", input);
    return response.data;
  },

  getMyBookings: async () => {
    const response = await api.get("/hirer/bookings");
    return response.data; // Application[] with venue + booking
  },

  // ---- Dashboard / reputation / compliance ----------------------
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

  // ---- My details -----------------------------------------------
  updateProfile: async (input: UpdateProfileInput) => {
    const response = await api.put("/hirer/profile", input);
    return response.data;
  },

  // GET /api/venues/stats
  // Fetches platform-wide stats for the landing page (no auth required)
  getPlatformStats: async (): Promise<{ totalBookings: number }> => {
    const response = await api.get("/venues/stats");
    return response.data;
  },
};
