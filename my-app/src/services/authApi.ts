// bridge between frontend and backend
import api from "@/services/api";
import { User } from "@/types";

// What we send to the backend for login
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
  role: string;
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
    const response = await api.get(`/users/${userID}/profile`); // get requests dont have a body
    return response.data.userProfile;
  },
};
