import api from "@/services/api";
import { Venue, Application, Booking, VendorComment } from "@/types";

export const vendorApi = {
  getVendorsVenues: async (vendorID: number): Promise<Venue[]> => {
    const response = await api.get(`/${vendorID}/venues`);
    return response.data;
  },

  getVendorApplications: async (vendorID: number): Promise<Application[]> => {
    const response = await api.get(`/${vendorID}/applications`);
    return response.data;
  },

  getVendorBookings: async (vendorID: number): Promise<Booking[]> => {
    const response = await api.get(`/${vendorID}/bookings`);
    return response.data;
  },

  getVendorComments: async (vendorID: number): Promise<VendorComment[]> => {
    const response = await api.get(`/${vendorID}/comments`);
    return response.data;
  },

  updateApplicationStatus: async (
    vendorID: number,
    applicationID: number,
    status: string,
  ): Promise<Application> => {
    const response = await api.put(`/${vendorID}/applications/${applicationID}`, { status });
    return response.data;
  },

  deleteApplicationComment: async (vendorID: number, commentID: number): Promise<boolean> => {
    const response = await api.delete(`/${vendorID}/comments/${commentID}`, {});
    return response.data;
  },

  editApplicationComment: async (
    vendorID: number,
    commentID: number,
    commentText: string,
  ): Promise<VendorComment> => {
    const response = await api.put(`/${vendorID}/comments/${commentID}`, { commentText });
    return response.data;
  },

  createComment: async (
    vendorID: number,
    bookingID: number,
    commentText: string,
  ): Promise<VendorComment> => {
    const response = await api.post(`/${vendorID}/comments/${bookingID}`, { commentText });
    return response.data;
  },
};
