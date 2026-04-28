import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { wishlistAPI } from '@/lib/api';
import type { Product } from '@/types';

export interface WishlistItem {
  id: string;
  productId: string;
  userId: string;
  notes?: string;
  priority?: 'low' | 'medium' | 'high';
  reminderPrice?: number;
  isReminderActive?: boolean;
  createdAt: string;
  product?: Product;
}

interface WishlistState {
  items: WishlistItem[];
  isLoading: boolean;
  fetchWishlist: () => Promise<void>;
  addItem: (productId: string) => Promise<boolean>;
  removeItem: (id: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  getWishlistItemId: (productId: string) => string | undefined;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      fetchWishlist: async () => {
        set({ isLoading: true });
        try {
          const { data } = await wishlistAPI.getAll();
          const wishlistData = data?.data || data;
          const items = Array.isArray(wishlistData) ? wishlistData : [];
          set({ items, isLoading: false });
        } catch (error) {
          console.error('Fetch wishlist error:', error);
          set({ items: [], isLoading: false });
        }
      },

      addItem: async (productId) => {
        try {
          await wishlistAPI.add(productId);
          await get().fetchWishlist();
          return true;
        } catch (error: unknown) {
          console.error('Add to wishlist error:', error);
          return false;
        }
      },

      removeItem: async (id) => {
        const currentItems = get().items;
        set({ items: currentItems.filter((item) => item.id !== id) });
        try {
          await wishlistAPI.remove(id);
          await get().fetchWishlist();
        } catch (error) {
          console.error('Remove from wishlist error:', error);
          await get().fetchWishlist();
          throw error;
        }
      },

      isInWishlist: (productId) => {
        return get().items.some((item) => item.productId === productId);
      },

      getWishlistItemId: (productId) => {
        return get().items.find((item) => item.productId === productId)?.id;
      },
    }),
    {
      name: 'sz_wishlist',
      partialize: (state) => ({ items: state.items }),
    }
  )
);