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
        const { token } = require('./authStore').useAuthStore.getState();
        if (!token) {
          // Keep whatever items are already in state (restored from localStorage)
          set({ isLoading: false });
          return;
        }

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
        const { token } = require('./authStore').useAuthStore.getState();
        if (!token) {
          try {
            const { productAPI } = require('@/lib/api');
            const { data } = await productAPI.getById(productId);
            const product = data?.data || data;
            
            const newItem: WishlistItem = {
              id: 'guest_' + productId,
              productId,
              userId: 'guest',
              createdAt: new Date().toISOString(),
              product
            };

            const currentItems = get().items;
            if (!currentItems.some(i => i.productId === productId)) {
              set({ items: [...currentItems, newItem] });
            }
            return true;
          } catch (error) {
            console.error('Guest wishlist add error:', error);
            return false;
          }
        }

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
        const { token } = require('./authStore').useAuthStore.getState();
        if (!token) {
          const currentItems = get().items;
          set({ items: currentItems.filter((item) => item.id !== id) });
          return;
        }

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