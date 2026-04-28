'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, Trash2, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { useWishlistStore } from '@/store/wishlistStore';
import { useAuthStore } from '@/store/authStore';
import { getProductPriceRange, getDiscountedPrice, getProductTotalStock } from '@/types';

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function WishlistPage() {
  const { items, isLoading, fetchWishlist, removeItem } = useWishlistStore();
  const { token } = useAuthStore();

  useEffect(() => {
    if (token) fetchWishlist();
  }, [token, fetchWishlist]);

  const handleRemove = async (id: string) => {
    try {
      await removeItem(id);
      toast.success('Removed from wishlist');
    } catch {
      toast.error('Failed to remove');
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center gap-6">
        <Heart className="w-16 h-16 text-white/10" />
        <h2 className="text-2xl font-bold text-white/50">Please login to view your wishlist</h2>
        <Link href="/auth/login" className="px-6 py-3 rounded-full bg-accent text-white font-semibold glow-red-hover transition-all">
          Login
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center gap-6">
        <Heart className="w-16 h-16 text-white/10" />
        <h2 className="text-2xl font-bold text-white/50">Your wishlist is empty</h2>
        <Link href="/shop" className="px-6 py-3 rounded-full bg-accent text-white font-semibold glow-red-hover transition-all">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 lg:pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold gradient-text">My Wishlist</h1>
          <p className="mt-2 text-sm text-white/40">{items.length} saved items</p>
        </motion.div>

        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {items.map((item, i) => {
            const product = item.product as any;
            const primaryImg = product?.images?.find((img: any) => img.isPrimary) || product?.images?.[0];
            const imgSrc = primaryImg?.url || '/images/hero2.jpg';
            
            // Get price from variants
            let priceDisplay = '—';
            let outOfStock = false;
            if (product?.variants && product.variants.length > 0) {
              const { min, max } = getProductPriceRange(product);
              const discount = product.discount || 0;
              const minD = getDiscountedPrice(min, discount);
              const maxD = getDiscountedPrice(max, discount);
              priceDisplay = minD === maxD ? `₹${minD.toLocaleString()}` : `₹${minD.toLocaleString()} – ₹${maxD.toLocaleString()}`;
              outOfStock = getProductTotalStock(product) === 0;
            }
            
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="group rounded-2xl overflow-hidden glass glass-hover relative"
              >
                <Link href={`/shop/${item.productId}`}>
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <Image
                      src={imgSrc}
                      alt={product?.name || 'Product'}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {outOfStock && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-xs font-bold text-white/70 tracking-wider uppercase">Out of Stock</span>
                      </div>
                    )}
                  </div>
                </Link>
                <div className="p-4">
                  <h3 className="text-sm font-medium text-white/80 line-clamp-1">{product?.name}</h3>
                  {product?.brand && <p className="text-[10px] text-white/25 mt-0.5">{product.brand}</p>}
                  <div className="mt-1.5">
                    <span className="text-sm font-bold text-white">{priceDisplay}</span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-1">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className={`w-2.5 h-2.5 ${j < Math.floor(product?.rating || 0) ? 'fill-accent text-accent' : 'text-white/10'}`} />
                    ))}
                    <span className="ml-1 text-[10px] text-white/30">{product?.rating || '0'}</span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Link
                      href={`/shop/${item.productId}`}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-accent/10 text-accent text-xs font-semibold hover:bg-accent hover:text-white transition-all"
                    >
                      View Product
                    </Link>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="p-2 rounded-lg glass text-white/30 hover:text-accent transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}