'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, Sparkles } from 'lucide-react';
import { productAPI } from '@/lib/api';
import { getProductPriceRange, getDiscountedPrice } from '@/types';

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function NewArrivalsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const { data } = await productAPI.getNewArrivals();
        setProducts(data.data?.products || data.data || []);
      } catch { /* fallback */ }
      setLoading(false);
    }
    fetch();
  }, []);

  return (
    <div className="min-h-screen pt-24 lg:pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <span className="text-accent text-xs font-semibold tracking-[0.2em] uppercase flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" /> Fresh Drops
          </span>
          <h1 className="mt-3 text-3xl sm:text-4xl font-bold gradient-text">New Arrivals</h1>
          <p className="mt-3 text-white/40 max-w-md mx-auto">Be the first to explore our latest additions</p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/30 text-lg">No new arrivals right now</p>
            <Link href="/shop" className="mt-4 text-accent text-sm hover:underline inline-block">Browse all products</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product, i) => {
              const img = product.images?.find((im: any) => im.isPrimary) || product.images?.[0];
              const imgSrc = img?.url || img?.imageUrl || '/images/hero2.jpg';
              const { min, max } = getProductPriceRange(product);
              const discount = product.discount || 0;
              const minD = getDiscountedPrice(min, discount);
              const maxD = getDiscountedPrice(max, discount);
              return (
                <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link href={`/shop/${product.id}`} className="group block rounded-2xl overflow-hidden glass glass-hover">
                    <div className="relative aspect-[3/4] overflow-hidden">
                      <Image src={imgSrc} alt={product.name} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                      <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white backdrop-blur-sm">New</span>
                    </div>
                    <div className="p-3 sm:p-4">
                      <h3 className="text-sm font-medium text-white/80 group-hover:text-white transition-colors line-clamp-1">{product.name}</h3>
                      <div className="mt-1.5">
                        {minD === maxD
                          ? <span className="text-sm font-bold text-white">₹{minD.toLocaleString()}</span>
                          : <span className="text-sm font-bold text-white">₹{minD.toLocaleString()} – ₹{maxD.toLocaleString()}</span>
                        }
                      </div>
                      <div className="mt-1.5 flex items-center gap-1">
                        {[...Array(5)].map((_, j) => <Star key={j} className={`w-2.5 h-2.5 ${j < Math.floor(product.rating || 0) ? 'fill-accent text-accent' : 'text-white/10'}`} />)}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
