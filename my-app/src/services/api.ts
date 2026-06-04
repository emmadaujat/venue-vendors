// Shared Axios client for the REST backend. All pages import this instance so the
// base URL and auth header are configured in one place.

import axios from "axios";

export const TOKEN_KEY = "vv_token";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
});

// Attach the stored JWT to every request as Authorization: Bearer <token>.
// typeof window guard is required because Next.js renders some pages server-side.
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
