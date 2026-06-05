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
  // -------------------------------------------------------------------
  // GET /venues
  // Fetch all venues belonging to the logged-in vendor
  // -------------------------------------------------------------------
  getVendorsVenues: async (): Promise<Venue[]> => {
    const response = await api.get(`/vendor/venues`);
    return response.data;
  },

  // -------------------------------------------------------------------
  // GET /applications
  // Fetch all applications submitted to the logged-in vendor's venues
  // -------------------------------------------------------------------
  getVendorApplications: async (): Promise<Application[]> => {
    const response = await api.get(`/vendor/applications`);
    return response.data;
  },

  // -------------------------------------------------------------------
  // GET /bookings
  // Fetch all bookings across the logged-in vendor's venues
  // -------------------------------------------------------------------
  getVendorBookings: async (): Promise<Booking[]> => {
    const response = await api.get(`/vendor/bookings`);
    return response.data;
  },

  // -------------------------------------------------------------------
  // GET /comments
  // Fetch all comments the logged-in vendor has left on bookings
  // -------------------------------------------------------------------
  getVendorComments: async (): Promise<VendorComment[]> => {
    const response = await api.get(`/vendor/comments`);
    return response.data;
  },

  // -------------------------------------------------------------------
  // PUT /applications/:applicationID
  // Update the status (Pending/Approved/Declined) of an application
  // -------------------------------------------------------------------
  updateApplicationStatus: async (applicationID: number, status: string): Promise<Application> => {
    const response = await api.put(`/vendor/applications/${applicationID}`, { status });
    return response.data;
  },

  // -------------------------------------------------------------------
  // DELETE /comments/:commentID
  // Delete a comment the logged-in vendor has left on a booking
  // -------------------------------------------------------------------
  deleteApplicationComment: async (commentID: number): Promise<{ message: string }> => {
    const response = await api.delete(`/vendor/comments/${commentID}`);
    return response.data;
  },

  // -------------------------------------------------------------------
  // PUT /comments/:commentID
  // Edit the text of an existing comment left by the logged-in vendor
  // -------------------------------------------------------------------
  editApplicationComment: async (
    commentID: number,
    commentText: string,
  ): Promise<VendorComment> => {
    const response = await api.put(`/vendor/comments/${commentID}`, { commentText });
    return response.data;
  },

  // -------------------------------------------------------------------
  // POST /bookings/:bookingID/comments
  // Add a new comment to a booking under the logged-in vendor's venue
  // -------------------------------------------------------------------
  createComment: async (bookingID: number, commentText: string): Promise<VendorComment> => {
    const response = await api.post(`/vendor/bookings/${bookingID}/comments`, { commentText });
    return response.data;
  },

  // -------------------------------------------------------------------
  // PUT /profile
  // Update the logged-in vendor's name and phone number
  // -------------------------------------------------------------------
  updateProfile: async (input: UpdateProfileInput) => {
    const response = await api.put("/vendor/profile", input);
    return response.data;
  },

  // -------------------------------------------------------------------
  // PUT /vendor/venues/:venueID
  // Update a venue's details, amenities and suitability tags
  // -------------------------------------------------------------------
  updateVenue: async (venueID: number, data: Partial<Venue>): Promise<{ message: string }> => {
    const response = await api.put(`/vendor/venues/${venueID}`, data);
    return response.data;
  },

  // -------------------------------------------------------------------
  // DELETE /vendor/venues/:venueID
  // Delete a venue — applications referencing it have venueID set to NULL
  // -------------------------------------------------------------------
  deleteVenue: async (venueID: number): Promise<{ message: string }> => {
    const response = await api.delete(`/vendor/venues/${venueID}`);
    return response.data;
  },

  // -------------------------------------------------------------------
  // POST /vendor/venues
  // Create a new venue for the logged-in vendor
  // -------------------------------------------------------------------
  createVenue: async (data: Partial<Venue>): Promise<{ message: string }> => {
    const response = await api.post(`/vendor/venues`, data);
    return response.data;
  },

  // -------------------------------------------------------------------
  // GET /vendor/hirers/:hirerID/bookings
  // Fetch full booking history for a specific hirer across all venues
  // -------------------------------------------------------------------
  getHirerBookingHistory: async (hirerID: number): Promise<Booking[]> => {
    const response = await api.get(`/vendor/hirers/${hirerID}/bookings`);
    return response.data;
  },

  // -------------------------------------------------------------------
  // GET /vendor/hirers/:hirerID/compliance
  // Fetch compliance documents and credibility score for a specific hirer
  // -------------------------------------------------------------------
  getHirerCompliance: async (
    hirerID: number,
  ): Promise<{ documents: ComplianceDocument[]; credibilityScore: number }> => {
    const response = await api.get(`/vendor/hirers/${hirerID}/compliance`);
    return response.data;
  },

  // -------------------------------------------------------------------
  // GET /vendor/venues/:venueId/blockedDates
  // Fetch blocked dates for a venue
  // -------------------------------------------------------------------
  getVenueBlockedDates: async (venueId: number): Promise<VenueBlockedDates[]> => {
    const response = await api.get(`/vendor/venues/${venueId}/blockedDates`);
    return response.data;
  },

  // -------------------------------------------------------------------
  // POST /vendor/venues/:venueId/blockedDates
  // Create blocked dates for a venue
  // -------------------------------------------------------------------
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

  // -------------------------------------------------------------------
  // DELETE /vendor/venues/:venueId/blockedDates/:blockDateId
  // Delete blocked dates for a venue
  // -------------------------------------------------------------------
  deleteVenueBlockedDates: async (
    venueId: number,
    blockedDateId: number,
  ): Promise<{ message: string }> => {
    const response = await api.delete(`/vendor/venues/${venueId}/blockedDates/${blockedDateId}`);
    return response.data;
  },

  // -------------------------------------------------------------------
  // DI - GET /vendor/stats?range=week|month|lastMonth|all
  // Returns the data for the four Infographic Report charts
  // -------------------------------------------------------------------
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
