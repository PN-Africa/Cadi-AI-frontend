import { create } from "zustand";
import { persist } from "zustand/middleware";

type User = {
  name?: string;
  email: string;
  role?: string;
};

type AuthStore = {
  user: User | null;
  token: string | null;
  setAuth: (data: { user: User; token: string }) => void;
  clearAuth: () => void;
  getDisplayName: () => string;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set,get) => ({
      user: null,
      token: null,
      setAuth: (data) =>
        set({
          user: data.user,
          token: data.token,
        }),
        getDisplayName: () => {
        const user = get().user;
        return user?.email ?? "";
      },
      clearAuth: () => set({ user: null, token: null }),
    }),
    {
      name: "auth-storage", // localStorage key
      partialize: (state) => ({ user: state.user, token: state.token }), // only persist data, not functions
    }
  )
);