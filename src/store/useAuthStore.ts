import { create } from 'zustand';

interface AuthState {
  userId: string | null;
  phoneNumber: string | null;
  token: string | null;
  isLoading: boolean;
  setUser: (userId: string | null, phoneNumber: string | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  phoneNumber: null,
  token: null,
  isLoading: false,
  setUser: (userId, phoneNumber) => set({ userId, phoneNumber }),
  setToken: (token) => set({ token }),
  setLoading: (isLoading) => set({ isLoading }),
}));


