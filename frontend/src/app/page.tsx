'use client';

import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Truck, ShieldCheck, RefreshCcw, CreditCard,
  ChevronRight, ChevronLeft as ChevronLeftIcon, Star,
} from 'lucide-react';
import { configAPI, productAPI } from '@/lib/api';
import { getProductPriceRange, getDiscountedPrice } from '@/types';
import WishlistButton from '@/components/WishlistButton';

/* eslint-disable @typescript-eslint/no-explicit-any */

// Icon map for perks section (stored as strings in config)
const iconMap: Record<string, React.ElementType> = { Truck, ShieldCheck, RefreshCcw, CreditCard };

// Default hero slides using all hero images
const defaultSlides = [
  { image: '/images/hero1.jpg', title: 'REDEFINE\nFASHION', subtitle: 'New Collection 2026', cta: 'SHOP NOW', ctaLink: '/shop' },
  { image: '/images/hero2.jpg', title: 'BOLD.\nFEARLESS.\nYOU.', subtitle: 'Streetwear Essentials', cta: 'SHOP NOW', ctaLink: '/shop' },
  { image: '/images/hero3.jpg', title: 'ELEVATE\nYOUR STYLE', subtitle: 'Premium Quality', cta: 'SHOP NOW', ctaLink: '/shop' },
  { image: '/images/hero4.jpg', title: 'STREET\nCULTURE', subtitle: 'Urban Collection', cta: 'SHOP NOW', ctaLink: '/shop' },
  { image: '/images/hero5.jpg', title: 'DEFINE\nYOURSELF', subtitle: 'Exclusive Drops', cta: 'SHOP NOW', ctaLink: '/shop' },
  { image: '/images/hero6.jpg', title: 'THE NEW\nWAVE', subtitle: 'Limited Edition', cta: 'SHOP NOW', ctaLink: '/shop' },
];

/* ─── Hero Carousel ────────────────────────────────────── */
function HeroSection({ config }: { config: any }) {
  const slides = defaultSlides;
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const goTo = useCallback((index: number) => {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  }, [current]);

  const goNext = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const goPrev = useCallback(() => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    intervalRef.current = setInterval(goNext, 5000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [goNext]);

  const pauseAutoPlay = () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  const resumeAutoPlay = () => { intervalRef.current = setInterval(goNext, 5000); };

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
  };

  return (
    <section className="relative w-full overflow-hidden bg-black flex items-center justify-center p-4 sm:p-8 min-h-[calc(100vh-4rem)] lg:min-h-[calc(100vh-5rem)]" onMouseEnter={pauseAutoPlay} onMouseLeave={resumeAutoPlay}>
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={current}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute inset-0"
        >
          <Image
            src={slides[current].image}
            alt="background blur"
            fill
            sizes="100vw"
            className="object-cover object-center blur-2xl opacity-40 scale-110"
            priority={current === 0}
            quality={10}
          />
          <div className="absolute inset-0 bg-black/60" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-4xl py-12 lg:py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col items-center w-full"
          >
            <div className="relative w-full aspect-[4/5] sm:w-[22rem] sm:h-[30rem] lg:w-[24rem] lg:h-[34rem] mb-8 overflow-hidden shadow-2xl">
              <Image
                src={slides[current].image}
                alt={slides[current].title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 22rem, 24rem"
                className="object-cover object-center"
                priority={current === 0}
                quality={90}
              />
            </div>
            
            <h1 className="font-serif text-3xl sm:text-3xl lg:text-4xl font-semibold tracking-[0.1em] sm:tracking-[0.2em] whitespace-pre-line uppercase text-white mb-2 text-center px-4">
              {slides[current].title}
            </h1>
            <p className="text-white/40 text-[10px] sm:text-xs tracking-[0.3em] uppercase mb-10 text-center">
              {slides[current].subtitle}
            </p>
            <div className="flex items-center justify-center gap-3 mb-10">
              {slides.map((_: any, i: number) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`transition-all duration-300 rounded-full ${
                    i === current
                      ? 'w-6 h-1 bg-white scale-110'
                      : 'w-1.5 h-1 bg-white/20 hover:bg-white/70'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
            
            <Link
              href={slides[current].ctaLink || '/shop'}
              className="font-serif bg-white text-black px-12 py-4 text-xs sm:text-sm font-black tracking-[0.2em] uppercase hover:bg-accent hover:text-white transition-all shadow-2xl"
            >
              {slides[current].cta}
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>

      <button
        onClick={goPrev}
        className="hidden sm:flex absolute left-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full text-white/30 hover:text-white transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeftIcon className="w-8 h-8" />
      </button>
      <button
        onClick={goNext}
        className="hidden sm:flex absolute right-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full text-white/30 hover:text-white transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight className="w-8 h-8" />
      </button>
    </section>
  );
}

/* ─── Categories ───────────────────────────────────────── */
function CategoriesSection({ sectionConfig, categories }: { sectionConfig: any; categories: any[] }) {
  const order = ['Formals', 'Casuals', 'Traditional', 'Sports'];
  const cats = order.map(name => categories.find(c => c.name === name)).filter(Boolean);
  
  return (
    <section className="relative py-16 md:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.6 }} className="flex items-end justify-between mb-8 md:mb-12">
        <div>
          <span className="font-serif text-accent text-xs font-semibold tracking-[0.2em] uppercase">Browse</span>
          <h2 className="font-serif mt-3 text-3xl sm:text-4xl font-bold gradient-text">{sectionConfig?.title || 'Shop by Category'}</h2>
        </div>
        <Link href="/categories" className="hidden sm:flex text-sm font-semibold text-white/50 hover:text-accent transition-all items-center gap-1 group">
          View all categories <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {cats.slice(0, 4).map((cat: any, i: number) => (
          <motion.div key={cat.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}>
            <Link href={`/shop?category=${cat.id}`} className="group block relative aspect-[4/5] sm:aspect-[3/4] rounded-2xl overflow-hidden glass glass-hover">
              <Image 
                src={cat.image || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=800'} 
                alt={cat.name} 
                fill 
                sizes="(max-width: 768px) 50vw, 20vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />
              
              <div className="absolute inset-0 p-4 sm:p-6 flex flex-col justify-end text-left">
                <h3 className="font-serif text-lg sm:text-4xl font-black text-white group-hover:text-accent transition-colors leading-tight uppercase tracking-tighter">{cat.name}</h3>
                <div className="mt-1 flex items-center gap-1 text-[9px] sm:text-xs font-bold text-accent uppercase tracking-[0.3em] opacity-90 group-hover:opacity-100 transition-all">
                  Discover <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ─── Generic Product Grid Section ────────────────────── */
function ProductGridSection({ title, subtitle, products, viewAllLink }: { 
  title: string; 
  subtitle: string; 
  products: any[]; 
  viewAllLink: string;
}) {
  if (products.length === 0) return null;

  return (
    <section className="relative py-12 md:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col gap-8 md:gap-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.6 }} className="flex items-end justify-between">
          <div>
            <span className="font-serif text-accent text-xs font-semibold tracking-[0.2em] uppercase">{subtitle}</span>
            <h2 className="font-serif mt-3 text-3xl sm:text-4xl font-bold gradient-text">{title}</h2>
          </div>
          <Link href={viewAllLink} className="hidden sm:flex items-center gap-1 text-sm font-semibold text-white/50 hover:text-accent transition-all group">
            Show more <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.slice(0, 4).map((product: any, i: number) => {
            const primaryImage = product.images?.find((img: any) => img.isPrimary) || product.images?.[0];
            const imgSrc = primaryImage?.url || 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800';
            const { min, max } = getProductPriceRange(product);
            const discount = product.discount || 0;
            const minD = getDiscountedPrice(min, discount);
            const hasDiscount = discount > 0;

            return (
              <motion.div key={product.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}>
                <div className="relative group rounded-2xl overflow-hidden glass glass-hover transition-all duration-300">
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <Link href={`/shop/${product.id}`} className="block h-full relative">
                      <Image 
                        src={imgSrc} 
                        alt={product.name} 
                        fill 
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105" 
                      />
                    </Link>
                    <WishlistButton productId={product.id} />
                    {hasDiscount && <span className="font-serif absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-accent text-white glow-red">{discount}% Off</span>}
                  </div>
                  <Link href={`/shop/${product.id}`} className="block p-4 bg-white/[0.02] backdrop-blur-md">
                    <h3 className="font-serif text-sm font-semibold text-white/90 group-hover:text-white transition-colors line-clamp-1">{product.name}</h3>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white font-serif">₹{minD.toLocaleString()}</span>
                        {hasDiscount && <span className="text-[10px] text-white/30 line-through">₹{min.toLocaleString()}</span>}
                      </div>
                      <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        (product.rating || 4.5) >= 4 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        (product.rating || 4.5) >= 3 ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                        (product.rating || 4.5) >= 2 ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                        'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        <Star className="w-2.5 h-2.5 fill-current" />
                        <span>{product.rating || '4.5'}</span>
                      </div>
                    </div>
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
        <div className="mt-8 text-center sm:hidden">
          <Link href={viewAllLink} className="inline-flex items-center gap-1 text-sm text-white/50 hover:text-accent transition-colors">View All {title} <ArrowRight className="w-4 h-4" /></Link>
        </div>
      </div>
    </section>
  );
}

/* ─── Dynamic Offer Banners ────────────────────────────── */
function OffersSection({ promotions }: { promotions: any[] }) {
  if (promotions.length === 0) return null;

  return (
    <section className="py-12 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.6 }} className="text-center mb-8 md:mb-12">
        <span className="font-serif text-accent text-xs font-semibold tracking-[0.2em] uppercase">Limited Time</span>
        <h2 className="font-serif mt-3 text-3xl sm:text-4xl font-bold gradient-text">Special Offers</h2>
      </motion.div>
      <div className={`grid grid-cols-1 ${promotions.length > 1 ? 'md:grid-cols-2' : ''} gap-4 md:gap-6`}>
        {promotions.map((offer: any, i: number) => (
          <motion.div key={offer.id} initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.15 }}>
            <Link href={offer.targetLink || '/shop'} className="group block relative rounded-2xl overflow-hidden h-40 sm:h-80 glass glass-hover">
              <Image 
                src={offer.bannerImage} 
                alt={offer.title} 
                fill 
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105" 
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
              <div className="relative z-10 flex flex-col justify-center h-full p-6 sm:p-10">
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">{offer.title}</h3>
                <p className="mt-2 text-sm text-white/60">{offer.subtitle}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm text-accent font-semibold group-hover:gap-2 transition-all">Shop Now <ArrowRight className="w-4 h-4" /></span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ─── Lookbook ─────────────────────────────────────────── */
function LookbookSection({ sectionConfig }: { sectionConfig: any }) {
  const images = sectionConfig?.config?.images || ['/images/hero4.jpg', '/images/hero5.jpg', '/images/hero6.jpg'];
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.6 }} className="text-center mb-16">
        <span className="font-serif text-accent text-xs font-semibold tracking-[0.2em] uppercase">Lookbook</span>
        <h2 className="font-serif mt-3 text-3xl sm:text-4xl font-bold gradient-text">{sectionConfig?.title || 'Style Inspiration'}</h2>
        <p className="mt-3 text-white/40 max-w-md mx-auto">{sectionConfig?.subtitle || 'Get inspired by our latest campaign looks'}</p>
      </motion.div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((img: string, i: number) => (
          <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.1 }} className="relative rounded-2xl overflow-hidden group aspect-[4/5] sm:aspect-[3/4]">
            <Image 
              src={img} 
              alt={`Lookbook ${i + 1}`} 
              fill 
              sizes="(max-width: 768px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105" 
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-500 flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-6 py-2 rounded-full glass text-sm text-white font-medium">View Look</span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ─── Section Renderer ─────────────────────────────────── */
const sectionComponents: Record<string, React.ComponentType<any>> = {
  hero: HeroSection,
  categories: CategoriesSection,
  offers: OffersSection,
  lookbook: LookbookSection,
};

/* ─── Page ─────────────────────────────────────────────── */
export default function Home() {
  const [categories, setCategories] = useState<any[]>([]);
  const [featured, setFeatured] = useState<any[]>([]);
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);
  const [topRated, setTopRated] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [featRes, newRes, trendRes, topRes, catRes, promoRes] = await Promise.allSettled([
          productAPI.getFeatured(),
          productAPI.getNewArrivals(),
          productAPI.getTrending(),
          productAPI.getTopRated(),
          configAPI.getCategories(),
          configAPI.getPromotions(),
        ]);
        
        if (featRes.status === 'fulfilled') setFeatured(featRes.value.data?.data || []);
        if (newRes.status === 'fulfilled') setNewArrivals(newRes.value.data?.data || []);
        if (trendRes.status === 'fulfilled') setTrending(trendRes.value.data?.data || []);
        if (topRes.status === 'fulfilled') setTopRated(topRes.value.data?.data || []);
        if (catRes.status === 'fulfilled') setCategories(catRes.value.data?.data || []);
        if (promoRes.status === 'fulfilled') setPromotions(promoRes.value.data?.data || []);
      } catch { /* ignore */ }
      setLoaded(true);
    }
    fetchData();
  }, []);

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-16 lg:pt-20">
      <HeroSection config={{}} />
      <CategoriesSection sectionConfig={{ title: 'Shop by Category' }} categories={categories} />
      
      <ProductGridSection 
        title="New Arrivals" 
        subtitle="The Fresh List" 
        products={newArrivals} 
        viewAllLink="/new-arrivals" 
      />

      <ProductGridSection 
        title="Featured Drops" 
        subtitle="Premium Selection" 
        products={featured} 
        viewAllLink="/featured" 
      />

      <ProductGridSection 
        title="Trending Now" 
        subtitle="Most Wanted" 
        products={trending} 
        viewAllLink="/trending" 
      />

      <ProductGridSection 
        title="High Rated" 
        subtitle="Customer Favorites" 
        products={topRated} 
        viewAllLink="/high-rated" 
      />

      <OffersSection promotions={promotions} />
      <LookbookSection sectionConfig={{ title: 'Style Inspiration' }} />
    </div>
  );
}