import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RecentlyViewedItem {
  _id: string;
  slug: string;
  name: string;
  brand: string;
  basePrice: number;
  image: string;
}

interface RecentlyViewedStore {
  items: RecentlyViewedItem[];
  addItem: (item: RecentlyViewedItem) => void;
}

const MAX_ITEMS = 6;

export const useRecentlyViewedStore = create<RecentlyViewedStore>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((s) => {
          const filtered = s.items.filter((i) => i._id !== item._id);
          return { items: [item, ...filtered].slice(0, MAX_ITEMS) };
        }),
    }),
    { name: 'tv-recently-viewed' },
  ),
);
