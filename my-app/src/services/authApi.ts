// authApi.ts - frontend API calls for authentication: sign-in, register, and get profile.
import api from "@/services/api";
import { User } from "@/types";

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: string; // "vendor" or "hirer"
}

export const authApi = {
  signIn: async (user: SignInCredentials) => {
    const response = await api.post("/signin", user);
    return response.data;
  },

  signUp: async (user: SignUpCredentials) => {
    const response = await api.post("/register", user);
    return response.data;
  },

  getProfile: async (userID: number): Promise<User> => {
    const response = await api.get(`/users/${userID}/profile`);
    return response.data.userProfile;
  },
};
