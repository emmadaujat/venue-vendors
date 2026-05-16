// ===========================================================
// api.ts — the ONE shared Axios client for the whole frontend
// ===========================================================
// Every page that talks to the /backend REST API should import
// this `api` instance instead of calling axios directly. Two
// reasons:
//
//  1. baseURL is configured in one place. Locally it points at
//     http://localhost:3001/api. On Render we set the env var
//     NEXT_PUBLIC_API_URL and nothing else has to change.
//
//  2. The request interceptor automatically attaches the logged
//     in user's JWT to every request as:
//        Authorization: Bearer <token>
//     so individual pages never have to remember to do this.
//
// (Task S7) 
// follows the Axios pattern from the week8 lecture example
// (example1/frontend/src/services/api.ts).
// ===========================================================

import axios from "axios";

// localStorage key where the JWT is stored after sign-in.
// The task plan calls for this exact name.
export const TOKEN_KEY = "vv_token";

const api = axios.create({
  // Use the deployed URL in production, fall back to localhost in dev.
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
});

// ---------------------------------------------------------------
// Request interceptor: runs BEFORE every request leaves the browser.
// If we have a saved token, add it to the Authorization header so
// the backend's requireAuth middleware (Task S4) accepts it.
// ---------------------------------------------------------------
api.interceptors.request.use((config) => {
  // localStorage only exists in the browser, not during Next.js
  // server-side rendering, so guard with a typeof check.
  if (typeof window !== "undefined") {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
