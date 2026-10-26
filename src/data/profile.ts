import { create } from "zustand";

interface ProfileState {
  name: string;
  setName: (name: string) => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  name: "",
  setName: (name) => set({ name: name.trim() }),
}));