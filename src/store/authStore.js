import { create } from 'zustand';
import { api, setAuthToken } from '../services/api/client';

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

  login: async ({ email, password }) => {
    set({ isLoading: true });
    try {
      // Attempt API call to backend
      const res = await api.login({ email, password });
      const { token, user } = res.data || {};

      if (token) {
        setAuthToken(token);
        set({
          token,
          user: user || { id: '1', name: email.split('@')[0] || 'User', email },
          isAuthenticated: true,
          isLoading: false,
        });
        return true;
      }
    } catch (e) {
      console.log('Backend connection fallback for login:', e.message);
    }

    // Fallback demo authentication when backend is offline
    await new Promise((resolve) => setTimeout(resolve, 800));
    const demoToken = 'demo_truvoice_token_' + Date.now();
    setAuthToken(demoToken);

    set({
      token: demoToken,
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: '1',
        name: email ? email.split('@')[0] : 'User',
        email: email || '',
        avatar: null,
      },
    });
    return true;
  },

  register: async ({ name, email, password }) => {
    set({ isLoading: true });
    try {
      await api.register({ name, email, password });
    } catch (e) {
      console.log('Backend connection fallback for register:', e.message);
    }

    await new Promise((resolve) => setTimeout(resolve, 800));
    set({
      isLoading: false,
      pendingUser: {
        name,
        email,
      },
    });
    return true;
  },

  verifyOTP: async (code) => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 800));

    const demoToken = 'demo_otp_token_' + Date.now();
    setAuthToken(demoToken);

    set({
      token: demoToken,
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: '1',
        name: 'User',
        email: '',
      },
    });

    return true;
  },

  loginAsGuest: async () => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 500));

    const guestToken = 'guest_token_' + Date.now();
    setAuthToken(guestToken);

    set({
      isLoading: false,
      isAuthenticated: true,
      token: guestToken,
      user: {
        id: 'guest',
        name: 'Guest User',
        email: 'guest@truvoice.app',
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