import { create } from 'zustand';
import { analysisService } from '../services/analysis/analysisService';
import { mapHistoryItem } from '../utils/analysisMapper';

export const useHistoryStore = create((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  fetchHistory: async () => {
    set({ isLoading: true, error: null });
    try {
      const rawItems = await analysisService.fetchHistory();
      const items = rawItems.map(mapHistoryItem);
      set({ items, isLoading: false });
      return items;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  prependItem: (analysisItem) => {
    const mapped = mapHistoryItem(analysisItem);
    set({ items: [mapped, ...get().items.filter((i) => i.id !== mapped.id)] });
  },

  getRecentCalls: (limit = 5) => get().items.slice(0, limit),

  clear: () => set({ items: [], error: null }),
}));

export default useHistoryStore;
