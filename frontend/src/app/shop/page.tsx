'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  X, Star, ChevronDown, Filter, 
  ArrowRight, SlidersHorizontal, ShoppingBag,
  Sparkles, TrendingUp, Heart, Tag, Check, Layers,
  IndianRupee, Zap, SortAsc, Package
} from 'lucide-react';
import { productAPI, configAPI } from '@/lib/api';
import { getProductPriceRange, getDiscountedPrice } from '@/types';
import WishlistButton from '@/components/WishlistButton';

/* ─── Components ────────────────────────────────────────── */

const StarRating = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-0.5">
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} className="w-2.5 h-2.5 fill-accent text-accent" />
      ))}
      {hasHalfStar && (
        <div className="relative w-2.5 h-2.5 overflow-hidden">
          <Star className="absolute top-0 left-0 w-2.5 h-2.5 text-white/10" />
          <div className="absolute top-0 left-0 w-1/2 h-full overflow-hidden">
            <Star className="w-2.5 h-2.5 fill-accent text-accent" />
          </div>
        </div>
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className="w-2.5 h-2.5 text-white/10" />
      ))}
      <span className="ml-1 text-[9px] font-black text-white/30 tracking-widest">{rating.toFixed(1)}</span>
    </div>
  );
};

const PriceSlider = ({ min, max, currentMin, currentMax, onChange }: { min: number, max: number, currentMin: number, currentMax: number, onChange: (min: number, max: number) => void }) => {
  return (
    <div className="py-6 px-2">
      <div className="flex justify-between mb-4">
        <span className="text-[10px] font-black text-accent uppercase tracking-widest">₹{currentMin.toLocaleString()}</span>
        <span className="text-[10px] font-black text-accent uppercase tracking-widest">₹{currentMax.toLocaleString()}</span>
      </div>
      <div className="relative h-1 w-full bg-white/5 rounded-full">
        <div 
          className="absolute h-full bg-accent glow-red rounded-full transition-all duration-150"
          style={{ 
            left: `${((currentMin - min) / (max - min)) * 100}%`,
            right: `${100 - ((currentMax - min) / (max - min)) * 100}%`
          }}
        />
      </div>
      <div className="relative w-full h-6 -mt-3.5">
        <input 
          type="range" min={min} max={max} value={currentMin} 
          onChange={(e) => onChange(Math.min(parseInt(e.target.value), currentMax - 100), currentMax)}
          className="absolute w-full h-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:shadow-xl [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-accent"
        />
        <input 
          type="range" min={min} max={max} value={currentMax} 
          onChange={(e) => onChange(currentMin, Math.max(parseInt(e.target.value), currentMin + 100))}
          className="absolute w-full h-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:shadow-xl [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-accent"
        />
      </div>
    </div>
  );
};

const DiscoverySection = ({ title, products, icon: Icon, onExplore }: { title: string; products: any[]; icon?: any; onExplore: () => void }) => {
  if (products.length === 0) return null;

  return (
    <section className="py-8 sm:py-12 border-b border-white/5 last:border-0">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div className="flex items-center gap-3 sm:gap-4">
          {Icon && (
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent shadow-inner">
              <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          )}
          <div>
            <h2 className="text-lg sm:text-2xl font-serif font-black text-white tracking-tight uppercase">{title}</h2>
            <p className="text-[10px] sm:text-[11px] text-white/30 uppercase tracking-[0.3em] sm:tracking-[0.4em] font-medium">SouthZone Curated</p>
          </div>
        </div>
        
        <button 
          onClick={onExplore}
          className="group flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full border border-white/5 bg-white/[0.02] hover:bg-accent/10 transition-all"
        >
          <span className="text-[9px] sm:text-[10px] font-black text-white/40 group-hover:text-white uppercase tracking-[0.15em] sm:tracking-[0.2em]">Explore All</span>
          <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white/20 group-hover:text-accent group-hover:translate-x-1 transition-all" />
        </button>
      </div>
      
      <div className="flex gap-3 sm:gap-6 overflow-x-auto no-scrollbar pb-4 sm:pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth">
        {products.map((product) => (
          <div key={product.id} className="min-w-[160px] sm:min-w-[240px] md:min-w-[280px] max-w-[280px] flex-shrink-0">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
};

const ProductCard = ({ product }: { product: any }) => {
  const img = product.images?.find((im: any) => im.isPrimary) || product.images?.[0];
  const imgSrc = img?.url || img?.imageUrl || '/images/hero2.jpg';
  const { min, max } = getProductPriceRange(product);
  const discount = product.discount || 0;
  const minDiscounted = getDiscountedPrice(min, discount);
  const hasDiscount = discount > 0;

  return (
    <div className="group relative flex flex-col h-full bg-white/[0.02] border border-white/5 rounded-2xl sm:rounded-3xl overflow-hidden hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500">
      <div className="relative aspect-[3/4] overflow-hidden">
        <Link href={`/shop/${product.id}`} className="block h-full relative">
          <Image 
            src={imgSrc} 
            alt={product.name} 
            fill 
            sizes="(max-width: 640px) 45vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw" 
            className="object-cover transition-transform duration-700 group-hover:scale-105" 
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </Link>
        
        <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-10">
          <WishlistButton productId={product.id} />
        </div>
        
        {hasDiscount && (
          <div className="absolute top-3 sm:top-4 left-3 sm:left-4 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest bg-accent text-white glow-red border border-white/10 shadow-2xl">
            {discount}% OFF
          </div>
        )}
      </div>

      <div className="p-3 sm:p-5 flex flex-col flex-1">
        <div className="mb-2 sm:mb-3">
          <h3 className="text-[11px] sm:text-xs font-normal text-white/90 group-hover:text-white transition-colors line-clamp-1 leading-tight uppercase tracking-wide">
            {product.name}
          </h3>
          <p className="text-[9px] sm:text-[10px] text-white/20 uppercase tracking-[0.15em] sm:tracking-[0.2em] font-medium mt-0.5 sm:mt-1">{product.brand || 'SouthZone'}</p>
        </div>

        <div className="mt-auto pt-3 sm:pt-4 border-t border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm sm:text-base font-semibold text-accent tracking-tighter leading-none">
                ₹{minDiscounted.toLocaleString()}
              </span>
            </div>
            <StarRating rating={product.rating || 4.2} />
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Shop Internal Content ────────────────────────────── */

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Data states
  const [trending, setTrending] = useState<any[]>([]);
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [topRated, setTopRated] = useState<any[]>([]);
  const [categorySections, setCategorySections] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  
  // Filter states
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [activeSizes, setActiveSizes] = useState<string[]>([]);
  const [availability, setAvailability] = useState<'all' | 'inStock'>('all');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 50000 });
  const [sortBy, setSortBy] = useState('Newest');
  const [searchQuery, setSearchQuery] = useState('');
  
  // UI states
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [initialDataFetched, setInitialDataFetched] = useState(false);
  // Explicit browse mode — only set to true AFTER filters are applied and fetch starts
  const [browseMode, setBrowseMode] = useState(false);

  const fetchAbortRef = useRef<AbortController | null>(null);
  const urlSyncRef = useRef(false); // Guards against URL sync clearing drawer selections
  const [debouncedPriceRange, setDebouncedPriceRange] = useState(priceRange);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedPriceRange(priceRange);
    }, 500);
    return () => clearTimeout(timer);
  }, [priceRange]);

  // Check if any filter is active (for determining browse vs discovery mode)
  const hasActiveFilters = useCallback(() => {
    return searchQuery !== '' || 
           activeCategories.length > 0 || 
           sortBy !== 'Newest' || 
           activeTags.length > 0 || 
           activeSizes.length > 0 ||
           availability !== 'all' ||
           debouncedPriceRange.min > 0 || 
           debouncedPriceRange.max < 50000;
  }, [searchQuery, activeCategories, sortBy, activeTags, activeSizes, availability, debouncedPriceRange]);

  const getPageSize = () => {
    if (typeof window === 'undefined') return 25;
    return window.innerWidth < 768 ? 12 : 25;
  };

  // ──────── URL Sync (only on mount or searchParams change) ────────
  useEffect(() => {
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');
    const sort = searchParams.get('sort');
    const shouldOpenFilter = searchParams.get('filter') === 'true';

    let hasUrlFilters = false;

    if (search) {
      setSearchQuery(search);
      hasUrlFilters = true;
    }

    if (category) {
      setActiveCategories([category]);
      hasUrlFilters = true;
    }

    if (tag) {
      setActiveTags([tag]);
      hasUrlFilters = true;
    }

    if (sort) {
      setSortBy(sort);
      hasUrlFilters = true;
    }

    if (shouldOpenFilter) setShowFilters(true);

    // Only clear state if navigating to plain /shop (no params at all)
    if (!search && !category && !tag && !sort) {
      // Mark this as a URL-driven reset so the filter effect doesn't re-trigger browse
      urlSyncRef.current = true;
      setSearchQuery('');
      setActiveCategories([]);
      setActiveTags([]);
      setSortBy('Newest');
      setPriceRange({ min: 0, max: 50000 });
      setActiveSizes([]);
      setAvailability('all');
      setBrowseMode(false);
      // Reset the guard after a tick
      setTimeout(() => { urlSyncRef.current = false; }, 50);
    } else if (hasUrlFilters) {
      setBrowseMode(true);
    }

    // Global Event Listener for Navbar Filter Icon
    const handleGlobalToggle = () => setShowFilters(prev => !prev);
    window.addEventListener('toggleShopFilters', handleGlobalToggle);
    return () => window.removeEventListener('toggleShopFilters', handleGlobalToggle);
  }, [searchParams]);

  // ──────── Fetch Initial Discovery Data ────────
  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const catRes = await configAPI.getCategories();
      const cats = catRes.data?.data || [];
      setCategories(cats);

      // Only fetch discovery data if not in browse mode
      if (!browseMode) {
        const [trendingRes, newRes, topRes] = await Promise.all([
          productAPI.getTrending(),
          productAPI.getNewArrivals(),
          productAPI.getTopRated()
        ]);

        setTrending(trendingRes.data?.data || []);
        setNewArrivals(newRes.data?.data || []);
        setTopRated(topRes.data?.data || []);

        const catPromises = cats.slice(0, 5).map((cat: any) => 
          productAPI.getAll({ categoryId: cat.id, limit: 10 })
        );
        const catResults = await Promise.all(catPromises);
        setCategorySections(catResults.map((res: any, i: number) => ({
          id: cats[i].id,
          name: cats[i].name,
          products: res.data?.data?.products || []
        })));
      }
    } catch (err) { console.error('Initial data fetch error:', err); }
    setLoading(false);
    setInitialDataFetched(true);
  }, [browseMode]);

  useEffect(() => { fetchInitialData(); }, []);

  // Refetch discovery data when returning from browse mode
  useEffect(() => {
    if (!browseMode && initialDataFetched && trending.length === 0) {
      const fetchLandingData = async () => {
        try {
          const [trendingRes, newRes, topRes] = await Promise.all([
            productAPI.getTrending(),
            productAPI.getNewArrivals(),
            productAPI.getTopRated()
          ]);
          setTrending(trendingRes.data?.data || []);
          setNewArrivals(newRes.data?.data || []);
          setTopRated(topRes.data?.data || []);

          const catPromises = categories.slice(0, 5).map((cat: any) => 
            productAPI.getAll({ categoryId: cat.id, limit: 10 })
          );
          const catResults = await Promise.all(catPromises);
          setCategorySections(catResults.map((res: any, i: number) => ({
            id: categories[i].id,
            name: categories[i].name,
            products: res.data?.data?.products || []
          })));
        } catch (err) { console.error(err); }
      };
      fetchLandingData();
    }
  }, [browseMode, initialDataFetched, trending.length, categories]);

  // ──────── Fetch Filtered Products ────────
  const fetchFilteredProducts = useCallback(async (isLoadMore = false) => {
    // Abort any in-flight request
    if (fetchAbortRef.current) {
      fetchAbortRef.current.abort();
    }
    const controller = new AbortController();
    fetchAbortRef.current = controller;

    if (isLoadMore) setLoadingMore(true);
    else setLoading(true);

    try {
      const limit = getPageSize();
      const currentPage = isLoadMore ? page + 1 : 1;
      
      const sortMap: Record<string, string> = {
        'Newest': '-createdAt',
        'Price: Low to High': 'price',
        'Price: High to Low': '-price',
        'Rating': '-rating'
      };

      const params: any = { 
        page: currentPage, 
        limit, 
        sort: sortMap[sortBy] || '-createdAt'
      };

      if (activeCategories.length > 0) params.categoryId = activeCategories;
      if (searchQuery) params.search = searchQuery;
      if (activeTags.length > 0) {
        if (activeTags.includes('On Sale')) params.discount = { gt: 0 };
        if (activeTags.includes('New Drops')) params.isNew = true;
        if (activeTags.includes('Trending')) params.isTrending = true;
        if (activeTags.includes('Featured')) params.isFeatured = true;
      }
      
      if (debouncedPriceRange.min > 0 || debouncedPriceRange.max < 50000) {
        params.price = { gte: debouncedPriceRange.min, lte: debouncedPriceRange.max };
      }

      // Size filter — passed to backend to filter by variant size
      if (activeSizes.length > 0) params.size = activeSizes;
      // Availability filter — only show products with stock > 0
      if (availability === 'inStock') params.stock = { gt: 0 };

      const res = await productAPI.getAll(params);
      
      // Check if this request was aborted
      if (controller.signal.aborted) return;

      const newProds = res.data?.data?.products || [];
      
      if (isLoadMore) {
        setProducts(prev => [...prev, ...newProds]);
        setPage(currentPage);
      } else {
        setProducts(newProds);
        setPage(1);
      }

      setTotalProducts(res.data?.data?.pagination?.total || 0);
      setHasMore(res.data?.data?.pagination?.page < res.data?.data?.pagination?.pages);
    } catch (err: any) {
      if (err?.name !== 'CanceledError' && err?.code !== 'ERR_CANCELED') {
        console.error('Filter fetch error:', err);
      }
    }

    if (!controller.signal.aborted) {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [activeCategories, sortBy, activeTags, activeSizes, availability, debouncedPriceRange, searchQuery, page]);

  // ──────── Trigger filtered fetch when filters change ────────
  useEffect(() => {
    // Don't fetch if we're in the middle of a URL-driven reset
    if (urlSyncRef.current) return;
    
    if (hasActiveFilters() && initialDataFetched) {
      setBrowseMode(true);
      fetchFilteredProducts();
    }
  }, [activeCategories, sortBy, activeTags, activeSizes, availability, debouncedPriceRange, searchQuery, initialDataFetched]);

  // ──────── Also trigger fetch when browseMode turns on from URL ────────
  useEffect(() => {
    if (browseMode && initialDataFetched && products.length === 0 && !loading) {
      fetchFilteredProducts();
    }
  }, [browseMode, initialDataFetched]);

  const toggleCategory = (id: string) => {
    setActiveCategories(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  const toggleTag = (tag: string) => {
    setActiveTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const toggleSize = (size: string) => {
    setActiveSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setActiveCategories([]);
    setSortBy('Newest');
    setActiveTags([]);
    setActiveSizes([]);
    setAvailability('all');
    setPriceRange({ min: 0, max: 50000 });
    setProducts([]);
    setTotalProducts(0);
    setBrowseMode(false);
    router.push('/shop');
  };

  const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

  const getResultsTitle = () => {
    const urlTag = searchParams.get('tag');
    if (searchQuery) return `Results for "${searchQuery}"`;
    if (sortBy === 'Rating' && activeCategories.length === 0) return "Top Rated Pieces";
    if ((activeTags.includes('Trending') || urlTag === 'Trending') && activeCategories.length === 0) return "Trending Now";
    if ((activeTags.includes('New Drops') || urlTag === 'New Drops') && activeCategories.length === 0) return "New Arrivals Collection";
    if ((activeTags.includes('Featured') || urlTag === 'Featured') && activeCategories.length === 0) return "Featured Drops";
    if (activeCategories.length === 1) {
      const cat = categories.find(c => c.id.toString() === activeCategories[0]);
      return cat ? `${cat.name} Collection` : "Refined Results";
    }
    if (activeCategories.length > 1) return "Combined Collections";
    return "Refined Results";
  };

  return (
    <>
      {/* Minimalist Header Area - Negative Space */}
      <div className="h-4 lg:h-8" />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pb-32 relative mt-16">
        {loading && !loadingMore && products.length === 0 && !browseMode ? (
          <div className="flex flex-col items-center justify-center py-48 gap-6">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-2 border-accent/20 rounded-full" />
              <div className="absolute inset-0 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-[10px] text-white/20 uppercase tracking-[0.6em] animate-pulse">Syncing Showroom</p>
          </div>
        ) : (
          <>
            {!browseMode ? (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                transition={{ duration: 0.5 }} 
                className="space-y-4 sm:space-y-6"
              >
                <DiscoverySection title="Most Liked" products={topRated} icon={Heart} onExplore={() => setSortBy('Rating')} />
                <DiscoverySection title="Trending Now" products={trending} icon={TrendingUp} onExplore={() => toggleTag('Trending')} />
                <DiscoverySection title="New Arrivals" products={newArrivals} icon={Sparkles} onExplore={() => toggleTag('New Drops')} />
                
                {categorySections.map((section) => (
                  <DiscoverySection 
                    key={section.id} 
                    title={section.name} 
                    products={section.products} 
                    onExplore={() => toggleCategory(section.id.toString())}
                  />
                ))}
              </motion.div>
            ) : (
              <div className={`relative transition-opacity duration-300 ${loading && !loadingMore ? 'opacity-40 pointer-events-none' : ''}`}>
                {loading && !loadingMore && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                    <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin shadow-2xl" />
                  </div>
                )}
                {/* Header */}
                <div className="flex items-center justify-between mb-8 sm:mb-16 border-b border-white/10 pb-6 sm:pb-10">
                  <div className="flex items-center gap-3 sm:gap-5">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl bg-accent/10 flex items-center justify-center text-accent shadow-inner">
                      <Zap className="w-5 h-5 sm:w-6 sm:h-6 fill-accent" />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-2xl font-serif font-black text-white uppercase tracking-tight">{getResultsTitle()}</h2>
                      <p className="text-[10px] sm:text-[11px] text-white/30 uppercase tracking-[0.3em] sm:tracking-[0.4em] font-medium mt-0.5 sm:mt-1">{totalProducts} Matches Found</p>
                    </div>
                  </div>
                  <button onClick={clearAllFilters} className="px-4 sm:px-8 py-2.5 sm:py-3.5 rounded-full border border-white/5 bg-white/[0.02] text-[9px] sm:text-[10px] font-black text-accent hover:bg-accent hover:text-white uppercase tracking-widest transition-all">Clear All</button>
                </div>

                {/* Product Grid — no layout animations, simple fade */}
                <div 
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6 lg:gap-10"
                  style={{ 
                    opacity: loading && !loadingMore ? 0.4 : 1, 
                    transition: 'opacity 0.3s ease' 
                  }}
                >
                  {products.map((product) => (
                    <div key={product.id} className="shop-product-card">
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>

                {/* No results state — only show if fetch completed */}
                {products.length === 0 && !loading && (
                  <div className="text-center py-32 sm:py-48 flex flex-col items-center">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center text-white/5 mb-6 sm:mb-8 shadow-inner"><ShoppingBag className="w-8 h-8 sm:w-10 sm:h-10" /></div>
                    <h3 className="text-xl sm:text-2xl font-serif font-bold text-white uppercase tracking-tight">No matches found</h3>
                    <p className="text-white/20 text-xs sm:text-sm mt-2 font-medium">Try broadening your refined parameters</p>
                    <button onClick={clearAllFilters} className="mt-8 sm:mt-10 px-10 sm:px-12 py-3.5 sm:py-4 bg-white text-black rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-accent hover:text-white transition-all shadow-2xl">Reset Filters</button>
                  </div>
                )}

                {/* Load More */}
                {hasMore && products.length > 0 && (
                  <div className="mt-16 sm:mt-28 flex flex-col items-center">
                    <div className="w-full max-w-[280px] sm:max-w-[320px] bg-white/5 h-1.5 rounded-full overflow-hidden mb-6 sm:mb-10 shadow-inner">
                      <div 
                        className="h-full bg-accent glow-red transition-all duration-500" 
                        style={{ width: `${(products.length / totalProducts) * 100}%` }} 
                      />
                    </div>
                    <button onClick={() => fetchFilteredProducts(true)} disabled={loadingMore} className="px-10 sm:px-16 py-4 sm:py-5 rounded-full border border-white/10 bg-white/[0.02] text-white text-[10px] font-black uppercase tracking-[0.3em] sm:tracking-[0.5em] hover:bg-white hover:text-black transition-all flex items-center gap-3 sm:gap-5 group">
                      {loadingMore ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : 'Load More Products'}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Unified Refine Drawer */}
      {showFilters && (
        <>
          <div 
            onClick={() => setShowFilters(false)} 
            className="fixed inset-0 z-[100] bg-black/80 sm:bg-black/90 sm:backdrop-blur-sm transition-opacity duration-300" 
            style={{ animation: 'fadeIn 0.2s ease' }}
          />
          <aside 
            className="fixed top-0 right-0 z-[110] h-[100dvh] w-full max-w-sm bg-surface border-l border-white/10 flex flex-col shadow-2xl transition-transform duration-300"
            style={{ animation: 'slideInRight 0.3s ease' }}
          >
            <div className="flex items-center justify-between p-5 sm:p-8 border-b border-white/5">
              <div className="flex items-center gap-3 sm:gap-4">
                <SlidersHorizontal className="w-5 h-5 text-accent" />
                <h2 className="text-lg sm:text-xl font-serif font-black text-white tracking-tight uppercase">Refine Selection</h2>
              </div>
              <button onClick={() => setShowFilters(false)} className="p-2.5 sm:p-3 text-white/20 hover:text-white transition-all bg-white/5 hover:bg-white/10 rounded-full"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-8 sm:space-y-12 custom-scrollbar overscroll-contain">
              {/* 1. Sorting Options */}
              <section>
                <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-4 sm:mb-6">Sort Ordering</h3>
                <div className="grid grid-cols-1 gap-2">
                  {['Newest', 'Price: Low to High', 'Price: High to Low', 'Rating'].map(opt => (
                    <button 
                      key={opt}
                      onClick={() => setSortBy(opt)}
                      className={`w-full p-3.5 sm:p-4 rounded-xl border transition-all flex items-center justify-between group ${
                        sortBy === opt ? 'bg-accent/10 border-accent text-white' : 'bg-white/5 border-white/5 text-white/30 hover:border-white/20'
                      }`}
                    >
                      <span className="text-[11px] font-bold uppercase tracking-widest">{opt}</span>
                      {sortBy === opt && <Check className="w-4 h-4 text-accent" />}
                    </button>
                  ))}
                </div>
              </section>

              {/* 2. Categories */}
              <section>
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Categories</h3>
                  {activeCategories.length > 0 && <button onClick={() => setActiveCategories([])} className="text-[9px] font-bold text-accent uppercase tracking-widest">Reset</button>}
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {categories.map((cat: any) => (
                    <button 
                      key={cat.id} 
                      onClick={() => toggleCategory(cat.id.toString())} 
                      className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-full text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] transition-all border ${
                        activeCategories.includes(cat.id.toString()) 
                          ? 'bg-accent border-accent text-white glow-red shadow-[0_0_15px_rgba(220,20,60,0.4)]' 
                          : 'bg-white/5 border-white/5 text-white/40 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </section>

              {/* 3. Sizes */}
              <section>
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Sizes</h3>
                  {activeSizes.length > 0 && <button onClick={() => setActiveSizes([])} className="text-[9px] font-bold text-accent uppercase tracking-widest">Reset</button>}
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {ALL_SIZES.map(size => (
                    <button 
                      key={size} 
                      onClick={() => toggleSize(size)}
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-[11px] sm:text-[12px] font-black transition-all border ${
                        activeSizes.includes(size) 
                          ? 'bg-accent border-accent text-white glow-red shadow-[0_0_15px_rgba(220,20,60,0.4)]' 
                          : 'bg-white/5 border-white/5 text-white/40 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </section>

              {/* 4. Availability */}
              <section>
                <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-4 sm:mb-6">Availability</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'all' as const, label: 'Show All' },
                    { key: 'inStock' as const, label: 'In Stock Only' },
                  ].map(opt => (
                    <button 
                      key={opt.key}
                      onClick={() => setAvailability(opt.key)}
                      className={`p-3.5 sm:p-4 rounded-xl border transition-all flex items-center justify-center gap-2 ${
                        availability === opt.key ? 'bg-accent/10 border-accent text-white' : 'bg-white/5 border-white/5 text-white/30 hover:border-white/20'
                      }`}
                    >
                      {opt.key === 'inStock' && <Package className="w-3.5 h-3.5" />}
                      <span className="text-[10px] font-bold uppercase tracking-widest">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </section>

              {/* 5. Price Linear Slider */}
              <section>
                <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-4 sm:mb-6">Price Boundary</h3>
                <PriceSlider 
                  min={0} max={50000} 
                  currentMin={priceRange.min} currentMax={priceRange.max} 
                  onChange={(min, max) => setPriceRange({ min, max })} 
                />
              </section>

              {/* 6. Collection Tags */}
              <section>
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Collection Tags</h3>
                  {activeTags.length > 0 && <button onClick={() => setActiveTags([])} className="text-[9px] font-bold text-accent uppercase tracking-widest">Reset</button>}
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {['New Drops', 'On Sale', 'Trending'].map(tag => (
                    <button 
                      key={tag} 
                      onClick={() => toggleTag(tag)}
                      className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-full text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] transition-all border ${
                        activeTags.includes(tag) 
                          ? 'bg-accent border-accent text-white glow-red shadow-[0_0_15px_rgba(220,20,60,0.4)]' 
                          : 'bg-white/5 border-white/5 text-white/40 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </section>
            </div>

            <div className="p-5 sm:p-8 border-t border-white/5 bg-black/20 flex gap-3 sm:gap-4 safe-area-pb">
              <button onClick={clearAllFilters} className="flex-1 px-6 sm:px-8 py-4 sm:py-5 rounded-2xl border border-white/10 text-white/30 text-[10px] font-black uppercase tracking-widest">Clear All</button>
              <button onClick={() => setShowFilters(false)} className="flex-1 px-6 sm:px-8 py-4 sm:py-5 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-accent hover:text-white transition-all shadow-2xl">Apply</button>
            </div>
          </aside>
        </>
      )}

      {/* Mobile Sticky Action Hub — lower position, smaller on mobile */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] w-[calc(100%-1.5rem)] max-w-sm">
        <div className="glass-strong rounded-2xl border border-white/10 p-1.5 sm:p-2 shadow-2xl flex items-center gap-1.5 sm:gap-2">
          <button 
            onClick={() => setShowFilters(true)}
            className="flex-1 flex items-center justify-center gap-2 sm:gap-3 py-2.5 sm:py-3 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-accent hover:text-white transition-all shadow-lg"
          >
            <Filter className="w-3.5 h-3.5" />
            Refine
          </button>
          <button 
            onClick={() => setShowFilters(true)}
            className="w-12 h-10 sm:w-14 sm:h-12 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
          >
            <SortAsc className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div></div>}>
      <ShopContent />
    </Suspense>
  );
}
