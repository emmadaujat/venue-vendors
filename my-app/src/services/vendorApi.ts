import axios from "axios";
import { Venue, Application } from "@/types";
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
};
