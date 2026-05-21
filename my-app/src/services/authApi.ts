// bridge between frontend and backend
import api from "@/services/api";
import { User } from "@/types";

// What we send to the backend for login
export interface SignInCredentials {
  email: string;
  password: string;
}

// What we send to the backend for registration
export interface SignUpCredentials {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: string; // "vendor" or "hirer"
}

export const authApi = {
  // Sign in with email and password, returns user data and JWT token
  signIn: async (user: SignInCredentials) => {
    const response = await api.post("/signin", user);
    return response.data;
  },

  // Register a new vendor or hirer account
  signUp: async (user: SignUpCredentials) => {
    const response = await api.post("/register", user);
    return response.data;
  },

  // Fetch a user's profile by ID — requires a valid JWT
  getProfile: async (userID: number): Promise<User> => {
    const response = await api.get(`/users/${userID}/profile`); // get requests dont have a body
    return response.data.userProfile;
  },
};
