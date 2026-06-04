import api from "@/services/api";
import {
  Venue,
  Application,
  Booking,
  VendorComment,
  ComplianceDocument,
  VenueBlockedDates,
} from "@/types";

// Input type for updating the vendor's profile
export interface UpdateProfileInput {
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export const vendorApi = {
  getVendorsVenues: async (): Promise<Venue[]> => {
    const response = await api.get(`/vendor/venues`);
    return response.data;
  },

  getVendorApplications: async (): Promise<Application[]> => {
    const response = await api.get(`/vendor/applications`);
    return response.data;
  },

  getVendorBookings: async (): Promise<Booking[]> => {
    const response = await api.get(`/vendor/bookings`);
    return response.data;
  },

  getVendorComments: async (): Promise<VendorComment[]> => {
    const response = await api.get(`/vendor/comments`);
    return response.data;
  },

  updateApplicationStatus: async (applicationID: number, status: string): Promise<Application> => {
    const response = await api.put(`/vendor/applications/${applicationID}`, { status });
    return response.data;
  },

  deleteApplicationComment: async (commentID: number): Promise<{ message: string }> => {
    const response = await api.delete(`/vendor/comments/${commentID}`);
    return response.data;
  },

  editApplicationComment: async (
    commentID: number,
    commentText: string,
  ): Promise<VendorComment> => {
    const response = await api.put(`/vendor/comments/${commentID}`, { commentText });
    return response.data;
  },

  createComment: async (bookingID: number, commentText: string): Promise<VendorComment> => {
    const response = await api.post(`/vendor/bookings/${bookingID}/comments`, { commentText });
    return response.data;
  },

  updateProfile: async (input: UpdateProfileInput) => {
    const response = await api.put("/vendor/profile", input);
    return response.data;
  },

  updateVenue: async (venueID: number, data: Partial<Venue>): Promise<{ message: string }> => {
    const response = await api.put(`/vendor/venues/${venueID}`, data);
    return response.data;
  },

  // Applications referencing a deleted venue have their venueID set to NULL.
  deleteVenue: async (venueID: number): Promise<{ message: string }> => {
    const response = await api.delete(`/vendor/venues/${venueID}`);
    return response.data;
  },

  createVenue: async (data: Partial<Venue>): Promise<{ message: string }> => {
    const response = await api.post(`/vendor/venues`, data);
    return response.data;
  },

  getHirerBookingHistory: async (hirerID: number): Promise<Booking[]> => {
    const response = await api.get(`/vendor/hirers/${hirerID}/bookings`);
    return response.data;
  },

  getHirerCompliance: async (
    hirerID: number,
  ): Promise<{ documents: ComplianceDocument[]; credibilityScore: number }> => {
    const response = await api.get(`/vendor/hirers/${hirerID}/compliance`);
    return response.data;
  },

  getVenueBlockedDates: async (venueId: number): Promise<VenueBlockedDates[]> => {
    const response = await api.get(`/vendor/venues/${venueId}/blockedDates`);
    return response.data;
  },

  createVenueBlockedDates: async (
    venueId: number,
    startDate: string,
    endDate: string,
    reason: string,
  ): Promise<VenueBlockedDates> => {
    const response = await api.post(`/vendor/venues/${venueId}/blockedDates`, {
      startDate,
      endDate,
      reason,
    });
    return response.data;
  },

  deleteVenueBlockedDates: async (
    venueId: number,
    blockedDateId: number,
  ): Promise<{ message: string }> => {
    const response = await api.delete(`/vendor/venues/${venueId}/blockedDates/${blockedDateId}`);
    return response.data;
  },

  getStats: async (range: string): Promise<VendorStats> => {
    const response = await api.get(`/vendor/stats`, { params: { range } });
    return response.data;
  },
};

// Shape returned by GET /vendor/stats.
export interface VendorStats {
  range: string;
  totalBookings: number;
  venueCount: number;
  perVenue: Array<Record<string, string | number>>;
  hirerNames: string[];
  venueNames: string[];
  stackedTotals: Array<Record<string, string | number>>;
  hirerPieData: Array<{ name: string; count: number }>;
  mostActive: { name: string; count: number } | null;
  leastActive: { name: string; count: number } | null;
  utilization: Array<{ date: string; count: number }>;
}
