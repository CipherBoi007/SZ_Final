'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function CartDrawer() {
  const { items, total, isOpen, closeCart, fetchCart, updateQuantity, removeItem, totalItems } = useCartStore();
  const { token } = useAuthStore();

  useEffect(() => {
    if (isOpen && token) {
      fetchCart();
    }
  }, [isOpen, token, fetchCart]);

  const handleUpdateQty = async (id: string, qty: number) => {
    if (qty < 1) return;
    try {
      await updateQuantity(id, qty);
    } catch {
      toast.error('Failed to update');
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await removeItem(id);
      toast.success('Item removed');
    } catch {
      toast.error('Failed to remove');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-surface border-l border-white/5 z-[70] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-accent" />
                Cart ({totalItems()})
              </h2>
              <button onClick={closeCart} className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag className="w-12 h-12 text-white/10 mb-4" />
                  <p className="text-white/30 mb-4">Your cart is empty</p>
                  <button onClick={closeCart}>
                    <Link href="/shop" className="text-accent text-sm hover:underline">
                      Start Shopping
                    </Link>
                  </button>
                </div>
              ) : (
                items.map((item: any) => {
                  const variant = item.variant || {};
                  const product = variant.Product || {};
                  const img = product.images?.find((im: any) => im.isPrimary) || product.images?.[0];
                  const imgSrc = img?.url || img?.imageUrl || '/images/hero2.jpg';
                  const price = Number(variant.price) || 0;

                  return (
                    <div key={item.id} className="flex gap-3 py-3 border-b border-white/5 last:border-0">
                      <div className="relative w-16 h-20 rounded-lg overflow-hidden shrink-0">
                        <Image src={imgSrc} alt={product.name || ''} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/shop/${variant.productId || product.id}`}
                          onClick={closeCart}
                          className="text-sm font-medium text-white/80 hover:text-white line-clamp-1 transition-colors"
                        >
                          {product.name}
                        </Link>
                        <p className="text-[10px] text-white/30 mt-0.5">{variant.size} / {variant.color}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center glass rounded-lg">
                            <button onClick={() => handleUpdateQty(item.id, Math.max(1, item.quantity - 1))} className="p-1.5 text-white/40 hover:text-white">
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center text-xs font-medium text-white">{item.quantity}</span>
                            <button onClick={() => handleUpdateQty(item.id, item.quantity + 1)} className="p-1.5 text-white/40 hover:text-white">
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="text-sm font-bold text-white">₹{(price * item.quantity).toLocaleString()}</span>
                        </div>
                      </div>
                      <button onClick={() => handleRemove(item.id)} className="self-start p-1 text-white/15 hover:text-white/50 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-6 py-5 border-t border-white/5 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Subtotal</span>
                  <span className="text-white font-bold">₹{total.toLocaleString()}</span>
                </div>
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-accent hover:bg-accent-hover text-white font-semibold transition-all glow-red-hover"
                >
                  View Cart <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
