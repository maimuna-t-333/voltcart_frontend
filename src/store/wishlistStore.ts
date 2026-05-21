import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/axios';

interface WishlistItem {
  _id: string;
  name: string;
  brand: string;
  slug: string;
  basePrice: number;
  comparePrice?: number;
  variantSku: string;
  image: string;
}

interface WishlistStore {
  items: WishlistItem[];
  isLoading: boolean;

  isInWishlist: (productId: string) => boolean;
  fetchWishlist: () => Promise<void>;
  toggleWishlist: (product: WishlistItem) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      isInWishlist: (productId) =>
        get().items.some((i) => i._id === productId),

      fetchWishlist: async () => {
        try {
          set({ isLoading: true });
          const { data } = await api.get('/users/profile');
          const wishlistIds: string[] = data.data.wishlist ?? [];

          if (wishlistIds.length === 0) {
            set({ items: [], isLoading: false });
            return;
          }

          const current = get().items;
          const filtered = current.filter((i) =>
            wishlistIds.some((id) => id === i._id)
          );
          set({ items: filtered, isLoading: false });
        } catch {
          set({ isLoading: false });
        }
      },

      toggleWishlist: async (product) => {
        const already = get().isInWishlist(product._id);

        if (already) {
          set((s) => ({ items: s.items.filter((i) => i._id !== product._id) }));
        } else {
          set((s) => ({ items: [...s.items, product] }));
        }

        try {
          if (already) {
            await api.delete(`/users/wishlist/${product._id}`);
          } else {
            await api.post(`/users/wishlist/${product._id}`);
          }
        } catch {
          if (already) {
            set((s) => ({ items: [...s.items, product] }));
          } else {
            set((s) => ({ items: s.items.filter((i) => i._id !== product._id) }));
          }
        }
      },

      removeFromWishlist: async (productId) => {
        const prev = get().items;
        set((s) => ({ items: s.items.filter((i) => i._id !== productId) }));
        try {
          await api.delete(`/users/wishlist/${productId}`);
        } catch {
          set({ items: prev });
        }
      },

      clearWishlist: () => set({ items: [] }),
    }),
    { name: 'tv-wishlist' }
  )
);