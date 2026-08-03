import { create } from 'zustand';
import { setAuthToken } from '../services/api/client';

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  hasOnboarded: false,

  setLoading: (loading) => set({ isLoading: loading }),

  setHasOnboarded: (value) =>
    set({
      hasOnboarded: value,
    }),

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
    }),

  setToken: (token) => {
    setAuthToken(token);

    set({
      token,
      isAuthenticated: !!token,
    });
  },

  login: async ({ email }) => {
    set({ isLoading: true });

    await new Promise((resolve) => setTimeout(resolve, 1200));

    const token = 'demo_token';

    setAuthToken(token);

    set({
      token,
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: '1',
        name: 'Tanmay',
        email,
        avatar: null,
      },
    });
  },

  register: async ({ name, email }) => {
    set({ isLoading: true });

    await new Promise((resolve) => setTimeout(resolve, 1200));

    set({
      isLoading: false,
      pendingUser: {
        name,
        email,
      },
    });

    return true;
  },

  verifyOTP: async () => {
    set({ isLoading: true });

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const token = 'demo_token';

    setAuthToken(token);

    set({
      token,
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: '1',
        name: 'Tanmay',
        email: 'you@truvoice.app',
      },
    });

    return true;
  },

  loginAsGuest: async () => {
    set({ isLoading: true });

    await new Promise((resolve) => setTimeout(resolve, 800));

    set({
      isLoading: false,
      isAuthenticated: true,
      token: 'guest_token',
      user: {
        id: 'guest',
        name: 'Guest User',
        email: null,
      },
    });
  },

  logout: () => {
    setAuthToken(null);

    set({
      token: null,
      user: null,
      isAuthenticated: false,
    });
  },
}));

export default useAuthStore;