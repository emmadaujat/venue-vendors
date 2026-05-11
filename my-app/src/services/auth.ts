// bridge between frontend and backend
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001/api",
});

// interface represents what we get back from the backend after login
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

export const authApi = {
  signIn: async (user: Partial<User>) => {
    const response = await api.post("/signin", user);
    return response.data;
  },

  signUp: async (user: Partial<User>) => {
    const response = await api.post("/register", user);
    return response.data;
  },
};
