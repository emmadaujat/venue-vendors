// bridge between frontend and backend
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001/api",
});

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

// interface represents what we get back from the backend after login
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
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
};
