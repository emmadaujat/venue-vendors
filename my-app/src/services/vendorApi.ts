import axios from "axios";
import { Venue, Application, Booking, VendorComment } from "@/types";
const api = axios.create({
  baseURL: "http://localhost:3001/api",
});

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
};
