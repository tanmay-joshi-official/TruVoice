import { create } from 'zustand';
import { setAuthToken } from '../services/api/client';

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  hasOnboarded: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setToken: (token) => {
    setAuthToken(token);
    set({ token, isAuthenticated: !!token });
  },
  setLoading: (isLoading) => set({ isLoading }),
  setHasOnboarded: (hasOnboarded) => set({ hasOnboarded }),
  logout: () => {
    setAuthToken(null);
    set({ user: null, token: null, isAuthenticated: false });
  },
}));

export default useAuthStore;
