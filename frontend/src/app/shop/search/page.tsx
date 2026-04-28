'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, X, Star, ChevronDown, ChevronLeft } from 'lucide-react';
import { productAPI } from '@/lib/api';
import { getProductPriceRange, getDiscountedPrice } from '@/types';

/* eslint-disable @typescript-eslint/no-explicit-any */

const sortOptions = ['Newest', 'Price: Low to High', 'Price: High to Low', 'Rating'];

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [sortBy, setSortBy] = useState('Newest');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        if (searchQuery.trim()) {
          const { data } = await productAPI.search(searchQuery);
          setProducts(data.data?.products || data.data || []);
        } else {
          setProducts([]);
        }
      } catch { setProducts([]); }
      setLoading(false);
    }
    const timeout = setTimeout(fetchData, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const getMinPrice = (p: any) => {
    const { min } = getProductPriceRange(p);
    return getDiscountedPrice(min, p.discount || 0);
  };

  const sorted = [...products].sort((a, b) => {
    const priceA = getMinPrice(a);
    const priceB = getMinPrice(b);
    if (sortBy === 'Price: Low to High') return priceA - priceB;
    if (sortBy === 'Price: High to Low') return priceB - priceA;
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
          <h1 className="text-3xl font-bold gradient-text">Search</h1>
        </motion.div>

        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search products..." autoFocus
              className="w-full rounded-xl bg-white/5 border border-white/10 py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/30 outline-none focus:border-accent/50 transition-colors" />
            {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"><X className="w-4 h-4" /></button>}
          </div>
          <div className="relative">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none w-full sm:w-48 rounded-xl bg-white/5 border border-white/10 py-3 px-4 pr-10 text-sm text-white/70 outline-none focus:border-accent/50 transition-colors cursor-pointer">
              {sortOptions.map((opt) => <option key={opt} value={opt} className="bg-surface text-white">{opt}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
          </div>
        </div>

        <div className="mt-8">
          {loading ? (
            <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>
          ) : sorted.length === 0 ? (
            <div className="text-center py-20">
              <Search className="w-12 h-12 text-white/10 mx-auto mb-4" />
              <p className="text-white/30 text-lg">{searchQuery ? `No results for "${searchQuery}"` : 'Start typing to search...'}</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-white/30 mb-6">{sorted.length} results for &quot;{searchQuery}&quot;</p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {sorted.map((product, i) => {
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>}>
      <SearchContent />
    </Suspense>
  );
}
