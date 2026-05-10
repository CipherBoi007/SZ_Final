'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChevronRight, ArrowRight, Layers, Sparkles, Zap, TrendingUp } from 'lucide-react';
import { configAPI } from '@/lib/api';

const CategoryCard = ({ category, index }: { category: any, index: number }) => {
  // Placeholder images for categories if they don't have one
  const images = [
    '/images/hero1.jpg',
    '/images/hero2.jpg',
    '/images/hero1.jpg',
    '/images/hero2.jpg',
  ];
  const imgSrc = category.imageUrl || images[index % images.length];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group relative aspect-[4/5] rounded-3xl overflow-hidden border border-white/5 bg-white/[0.02]"
    >
      <Image 
        src={imgSrc} 
        alt={category.name} 
        fill 
        className="object-cover transition-transform duration-1000 group-hover:scale-110 opacity-60 group-hover:opacity-100" 
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
      
      <div className="absolute inset-0 p-8 flex flex-col justify-end">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-px bg-accent" />
          <span className="text-[10px] font-black text-accent uppercase tracking-[0.4em]">Section 0{index + 1}</span>
        </div>
        <h3 className="text-3xl font-serif font-black text-white uppercase tracking-tight mb-6">{category.name}</h3>
        
        <Link 
          href={`/shop?category=${category.id}`}
          className="w-fit flex items-center gap-3 px-6 py-3 rounded-full bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-accent hover:text-white transition-all shadow-2xl"
        >
          View Collection <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </motion.div>
  );
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCats() {
      try {
        const { data } = await configAPI.getCategories();
        setCategories(data.data || []);
      } catch (err) { console.error(err); }
      setLoading(false);
    }
    fetchCats();
  }, []);

  return (
    <div className="min-h-screen bg-black pt-24 lg:pt-32 pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-24 text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-black uppercase tracking-[0.4em] mb-8"
          >
            <Layers className="w-4 h-4" /> The Collections
          </motion.div>
          <h1 className="text-5xl lg:text-7xl font-serif font-black text-white uppercase tracking-tight mb-6">Select Genre</h1>
          <p className="max-w-2xl mx-auto text-white/30 text-sm font-medium tracking-widest uppercase leading-relaxed">
            Curated pathways to our most iconic silhouettes and seasonal drops.
          </p>
        </header>

        {loading ? (
          <div className="flex flex-col items-center py-32 gap-6">
            <div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <p className="text-[10px] text-white/20 uppercase tracking-[0.6em]">Syncing Archives</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((cat, i) => (
              <CategoryCard key={cat.id} category={cat} index={i} />
            ))}

            {/* Special Dynamic Categories */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="group relative aspect-[4/5] rounded-3xl overflow-hidden border border-accent/20 bg-accent/5 p-12 flex flex-col justify-center items-center text-center"
            >
              <Sparkles className="w-12 h-12 text-accent mb-6 animate-pulse" />
              <h3 className="text-3xl font-serif font-black text-white uppercase tracking-tight mb-4">New Drops</h3>
              <p className="text-white/30 text-xs font-medium uppercase tracking-[0.3em] mb-8">Fresh Arrivals Today</p>
              <Link 
                href="/shop?tag=New Drops"
                className="flex items-center gap-3 px-8 py-4 rounded-full bg-accent text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all glow-red"
              >
                Enter Room <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="group relative aspect-[4/5] rounded-3xl overflow-hidden border border-white/5 bg-white/[0.02] p-12 flex flex-col justify-center items-center text-center"
            >
              <TrendingUp className="w-12 h-12 text-white/20 mb-6" />
              <h3 className="text-3xl font-serif font-black text-white uppercase tracking-tight mb-4">Trending</h3>
              <p className="text-white/30 text-xs font-medium uppercase tracking-[0.3em] mb-8">Most Wanted Pieces</p>
              <Link 
                href="/shop?tag=Trending"
                className="flex items-center gap-3 px-8 py-4 rounded-full border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
              >
                Enter Room <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
