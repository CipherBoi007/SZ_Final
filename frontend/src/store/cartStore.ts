import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '@/types';
import { cartAPI } from '@/lib/api';

interface CartState {
  items: CartItem[];
  total: number;
  isLoading: boolean;
  isOpen: boolean;
  fetchCart: () => Promise<void>;
  addItem: (data: { variantId: string; quantity: number }, productDetails?: { product: any; variant: any }) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: () => number;
  openCart: () => void;
  closeCart: () => void;
  resetCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      isLoading: false,
      isOpen: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      resetCart: () => {
        set({ items: [], total: 0, isLoading: false });
      },

      fetchCart: async () => {
        const { token } = require('./authStore').useAuthStore.getState();
        if (!token) {
          // Keep whatever items are already in state (restored from localStorage)
          set({ isLoading: false });
          return;
        }
        
        set({ isLoading: true });
        try {
          const { data } = await cartAPI.get();
          const cartData = data.data || {};
          set({
            items: cartData.items || [],
            total: parseFloat(cartData.total) || 0,
            isLoading: false,
          });
        } catch (error) {
          console.error('Fetch cart error:', error);
          set({ isLoading: false });
        }
      },

      addItem: async (itemData, productDetails) => {
        const { token } = require('./authStore').useAuthStore.getState();
        if (!token) {
          const currentItems = get().items;
          const existingItemIndex = currentItems.findIndex(item => item.variantId === itemData.variantId);
          
          let newItems = [...currentItems];
          if (existingItemIndex > -1) {
            newItems[existingItemIndex] = {
              ...newItems[existingItemIndex],
              quantity: newItems[existingItemIndex].quantity + itemData.quantity
            };
          } else if (productDetails) {
            const { product, variant } = productDetails;
            const newItem: CartItem = {
              id: 'guest_' + itemData.variantId,
              variantId: itemData.variantId,
              quantity: itemData.quantity,
              userId: 'guest',
              variant: {
                id: variant.id,
                size: variant.size,
                color: variant.color,
                price: Number(variant.price),
                stock: variant.stock,
                sku: variant.sku,
                Product: {
                  id: product.id,
                  name: product.name,
                  brand: product.brand,
                  images: product.images,
                  discount: product.discount
                } as any
              }
            };
            newItems.push(newItem);
          }
          
          const newTotal = newItems.reduce((sum, item) => {
            const price = Number(item.variant.price);
            const discount = (item.variant.Product as any).discount || 0;
            const finalPrice = Math.round(price * (1 - discount / 100));
            return sum + finalPrice * item.quantity;
          }, 0);

          set({ items: newItems, total: newTotal });
          return;
        }
        
        try {
          await cartAPI.add(itemData);
          await get().fetchCart();
        } catch (error: unknown) {
          console.error('Add item error:', error);
          throw error;
        }
      },

      updateQuantity: async (id, quantity) => {
        const { token } = require('./authStore').useAuthStore.getState();
        if (!token) {
          const newItems = get().items.map(item => 
            item.id === id ? { ...item, quantity } : item
          );
          const newTotal = newItems.reduce((sum, item) => {
            const price = Number(item.variant.price);
            const discount = (item.variant.Product as any).discount || 0;
            const finalPrice = Math.round(price * (1 - discount / 100));
            return sum + finalPrice * item.quantity;
          }, 0);
          set({ items: newItems, total: newTotal });
          return;
        }

        try {
          await cartAPI.update(id, { quantity });
          await get().fetchCart();
        } catch (error) {
          console.error('Update quantity error:', error);
          throw error;
        }
      },

      removeItem: async (id) => {
        const { token } = require('./authStore').useAuthStore.getState();
        if (!token) {
          const newItems = get().items.filter(item => item.id !== id);
          const newTotal = newItems.reduce((sum, item) => {
            const price = Number(item.variant.price);
            const discount = (item.variant.Product as any).discount || 0;
            const finalPrice = Math.round(price * (1 - discount / 100));
            return sum + finalPrice * item.quantity;
          }, 0);
          set({ items: newItems, total: newTotal });
          return;
        }

        const currentItems = get().items;
        set({ items: currentItems.filter((item) => item.id !== id) });
        try {
          await cartAPI.remove(id);
          await get().fetchCart();
        } catch (error) {
          await get().fetchCart();
          throw error;
        }
      },

      clearCart: async () => {
        const { token } = require('./authStore').useAuthStore.getState();
        if (!token) {
          set({ items: [], total: 0 });
          return;
        }

        try {
          await cartAPI.clear();
          set({ items: [], total: 0 });
        } catch (error) {
          console.error('Clear cart error:', error);
        }
      },

      totalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: 'sz_cart',
      partialize: (state) => ({ items: state.items, total: state.total }),
    }
  )
);