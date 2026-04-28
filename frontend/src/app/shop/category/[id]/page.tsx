'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, ChevronLeft, ChevronDown } from 'lucide-react';
import { productAPI, configAPI } from '@/lib/api';
import { getProductPriceRange, getDiscountedPrice } from '@/types';

/* eslint-disable @typescript-eslint/no-explicit-any */

const sortOptions = ['Newest', 'Price: Low to High', 'Price: High to Low', 'Rating'];

export default function CategoryPage() {
  const { id } = useParams();
  const [products, setProducts] = useState<any[]>([]);
  const [category, setCategory] = useState<any>(null);
  const [sortBy, setSortBy] = useState('Newest');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const [prodRes, catRes] = await Promise.allSettled([
          productAPI.getByCategory(id as string),
          configAPI.getCategories(),
        ]);
        if (prodRes.status === 'fulfilled') setProducts(prodRes.value.data?.data?.products || prodRes.value.data?.data || []);
        if (catRes.status === 'fulfilled') {
          const cats = catRes.value.data?.data || [];
          setCategory(cats.find((c: any) => c.id.toString() === id));
        }
      } catch { /* fallback */ }
      setLoading(false);
    }
    if (id) fetch();
  }, [id]);

  const getMinPrice = (p: any) => {
    const { min } = getProductPriceRange(p);
    return getDiscountedPrice(min, p.discount || 0);
  };

  const sorted = [...products].sort((a, b) => {
    if (sortBy === 'Price: Low to High') return getMinPrice(a) - getMinPrice(b);
    if (sortBy === 'Price: High to Low') return getMinPrice(b) - getMinPrice(a);
    if (sortBy === 'Rating') return (b.rating || 0) - (a.rating || 0);
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="min-h-screen pt-24 lg:pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/shop" className="flex items-center gap-1 text-sm text-white/30 hover:text-white/60 transition-colors mb-6">
          <ChevronLeft className="w-4 h-4" /> Shop
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl sm:text-4xl font-bold gradient-text">{category?.name || 'Category'}</h1>
          {category?.description && <p className="mt-2 text-white/40">{category.description}</p>}
        </motion.div>

        <div className="mt-6 flex justify-between items-center">
          <p className="text-sm text-white/30">{sorted.length} products</p>
          <div className="relative">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none w-48 rounded-xl bg-white/5 border border-white/10 py-2.5 px-4 pr-10 text-sm text-white/70 outline-none focus:border-accent/50 cursor-pointer">
              {sortOptions.map((opt) => <option key={opt} value={opt} className="bg-surface text-white">{opt}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
          </div>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>
          ) : sorted.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-white/30 text-lg">No products in this category</p>
              <Link href="/shop" className="mt-4 text-accent text-sm hover:underline inline-block">Browse all products</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {sorted.map((product, i) => {
                const img = product.images?.find((im: any) => im.isPrimary) || product.images?.[0];
                const imgSrc = img?.url || '/images/hero2.jpg';
                const { min, max } = getProductPriceRange(product);
                const discount = product.discount || 0;
                const minD = getDiscountedPrice(min, discount);
                const maxD = getDiscountedPrice(max, discount);
                return (
                  <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Link href={`/shop/${product.id}`} className="group block rounded-2xl overflow-hidden glass glass-hover">
                      <div className="relative aspect-[3/4] overflow-hidden">
                        <Image src={imgSrc} alt={product.name} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                        {discount > 0 && <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-accent text-white">{discount}% Off</span>}
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
    </div>
  );
}
