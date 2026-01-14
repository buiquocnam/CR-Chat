import api from "@/lib/axios";
import { User } from "@/types/user";

export const authService = {
  signUp: async (
    username: string,
    password: string,
    email: string,
    firstName: string,
    lastName: string
  ) => {
    const res = await api.post<{ accessToken: string, user: User }>(
      "/auth/register",
      { username, password, email, firstName, lastName },
      { withCredentials: true }
    );

    return res.data;
  },

  signIn: async (email: string, password: string) => {
    const res = await api.post<{ accessToken: string, user: User }>(
      "/auth/login",
      { email, password },
      { withCredentials: true }
    );
    return res.data;
  },

  signOut: async () => {
    return api.post<void>("/auth/logout", { withCredentials: true });
  },

  fetchMe: async () => {
    const res = await api.get<User>("/users/profile", { withCredentials: true });
    return res.data;
  },

  refresh: async () => {
    const res = await api.post<{ accessToken: string }>("/auth/refresh", { withCredentials: true });
    return res.data.accessToken;
  },
};