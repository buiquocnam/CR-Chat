import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types/user";


interface AuthState {
  accessToken: string | null;
  user: User | null;

  setAccessToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,

      setAccessToken: (accessToken) => set({ accessToken }),
      setUser: (user) => set({ user }),
      clear: () => set({ accessToken: null, user: null }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ 
        user: state.user,
        // accessToken: state.accessToken <- Removed for security
      }), 
    }
  )
);
