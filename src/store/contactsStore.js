import { create } from 'zustand';

export const useContactsStore = create((set) => ({
  contacts: [],
  recentContacts: [],
  isLoading: false,
  searchQuery: '',

  setContacts: (contacts) => set({ contacts }),
  setRecentContacts: (recentContacts) => set({ recentContacts }),
  setLoading: (isLoading) => set({ isLoading }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
}));

export default useContactsStore;
