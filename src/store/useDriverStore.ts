import { create } from 'zustand';
import type {
  DriverAvailability,
  DriverProfile,
  DriverRoute,
} from '../types/driver';

interface DriverState {
  profile: DriverProfile | null;
  isSaving: boolean;
  setProfile: (profile: DriverProfile | null) => void;
  updateAvailability: (availability: DriverAvailability) => void;
  updateRoute: (route: DriverRoute) => void;
}

export const useDriverStore = create<DriverState>((set) => ({
  profile: null,
  isSaving: false,
  setProfile: (profile) => set({ profile }),
  updateAvailability: (availability) =>
    set((state) =>
      state.profile ? { profile: { ...state.profile, availability } } : state,
    ),
  updateRoute: (route) =>
    set((state) =>
      state.profile ? { profile: { ...state.profile, route } } : state,
    ),
}));


