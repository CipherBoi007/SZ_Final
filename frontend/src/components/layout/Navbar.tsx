'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ShoppingBag, Heart, User, Menu, X, ChevronDown,
  Home, Sparkles, Percent, SlidersHorizontal, Store, Package,
  Shield, MapPin
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { productAPI } from '@/lib/api';
import { getProductPriceRange, getDiscountedPrice } from '@/types';
import CartDrawer from './CartDrawer';

/* ─── Mobile Nav Item Component ────────────────────────── */
function MobileNavItem({ link, setMobileOpen }: { link: any; setMobileOpen: (v: boolean) => void }) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = link.children;

  return (
    <div className="flex flex-col">
      <div className="flex items-center">
        <Link
          href={link.href === '#' ? '' : link.href}
          onClick={(e) => {
            if (hasChildren) {
              e.preventDefault();
              setExpanded(!expanded);
            } else {
              setMobileOpen(false);
            }
          }}
          className={`flex-1 flex items-center gap-3 px-4 py-3.5 text-base font-medium rounded-xl transition-all ${
            expanded ? 'bg-white/5 text-accent' : 'text-white/70 hover:text-white hover:bg-white/5'
          }`}
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {link.icon && <link.icon className="w-5 h-5 opacity-70" />}
          {link.label}
        </Link>
        {hasChildren && (
          <button 
            onClick={() => setExpanded(!expanded)}
            className="p-3.5 text-white/30 hover:text-white"
          >
            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>
      
      <AnimatePresence>
        {hasChildren && expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden pl-12 pr-4"
          >
            <div className="py-2 flex flex-col gap-1 border-l border-white/5 ml-2">
              {link.children.map((child: any) => (
                <Link
                  key={child.label}
                  href={child.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-2.5 text-sm text-white/40 hover:text-accent transition-colors"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {child.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const navLinks = [
  { href: '/', label: 'Home', icon: Home },
  {
    href: '/shop', label: 'Showroom', icon: Store, children: [
      { href: '/shop?category=Midnight Selection', label: 'The Formal Edit' },
      { href: '/shop?category=Avant-Garde Edge', label: 'Heritage Collection' },
      { href: '/shop?category=Minimalist Noir', label: 'Daily Essentials' },
      { href: '/shop?category=Urban Elite', label: 'Active Performance' },
    ],
  },
  { 
    href: '#', label: 'Campaigns', icon: Sparkles, children: [
      { href: '/shop?tag=New Drops', label: 'Fresh Arrivals' },
      { href: '/shop?tag=Trending', label: 'Boutique Trending' },
      { href: '/shop?sortBy=Rating', label: 'Elite Favorites' },
    ]
  },
  { href: '/shop?sale=true', label: 'Exclusive Offers', icon: Percent },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const openCart = useCartStore((s) => s.openCart);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user } = useAuthStore();
  
  // Hide Navbar on Admin pages to avoid redundancy
  const isAdmin = pathname.startsWith('/admin');

  const memberLinks = [
    { href: '/profile', label: 'Member Identity', icon: User },
    { href: '/profile?tab=orders', label: 'Order Manifests', icon: Package },
    { href: '/profile?tab=addresses', label: 'Delivery Hubs', icon: MapPin },
    { href: '/wishlist', label: 'Curated Wishlist', icon: Heart },
  ];

  const currentNavLinks = user?.role === 'admin' ? [
    { href: '/admin', label: 'Executive Hub', icon: SlidersHorizontal },
    { href: '/admin/products', label: 'Catalog Audit', icon: Package },
    { href: '/admin/orders', label: 'Fulfillment', icon: ShoppingBag },
    { href: '/admin/reviews', label: 'Social Proof', icon: Heart }
  ] : (user ? [...navLinks, { href: '#', label: 'Member Vault', icon: Shield, children: memberLinks }] : navLinks);
  
  const cartItems = useCartStore((s) => s.items);
  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!searchOpen) {
      setSearchQuery('');
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const { data } = await productAPI.search(searchQuery.trim());
        setSearchResults(data.data || []);
      } catch (error) {
        console.error('Search error', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, searchOpen]);

  const handleFilterToggle = () => {
    if (window.location.pathname === '/shop') {
      window.dispatchEvent(new CustomEvent('toggleShopFilters'));
    } else {
      window.location.href = '/shop?filter=true';
    }
  };

  return (
    <>
      {!isAdmin && (
        <>
          <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 bg-background transition-all duration-500 ${
          scrolled ? 'shadow-lg shadow-black/20 border-b border-white/5' : ''
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between lg:h-20">
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 text-white/70 hover:text-white transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <Image
                src="/images/LOGO.png"
                alt="SouthZone"
                width={140}
                height={42}
                className="h-8 w-auto lg:h-10 rounded"
                priority
              />
            </Link>

            {/* Center Space - Cleared for Minimalism */}
            <div className="hidden lg:block flex-1" />

            {/* Right icons */}
            <div className="flex items-center gap-1 sm:gap-2">
              <Link
                href="/shop"
                className="p-2 sm:p-2.5 text-white/70 hover:text-white transition-colors rounded-full hover:bg-white/5"
                aria-label="Shop"
              >
                <Store className="w-5 h-5" />
              </Link>

              <button
                onClick={handleFilterToggle}
                className="hidden lg:flex p-2 sm:p-2.5 text-white/70 hover:text-white transition-colors rounded-full hover:bg-white/5"
                aria-label="Filter"
              >
                <SlidersHorizontal className="w-5 h-5" />
              </button>

              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 sm:p-2.5 text-white/70 hover:text-white transition-colors rounded-full hover:bg-white/5"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              <Link
                href="/wishlist"
                className="p-2 sm:p-2.5 text-white/70 hover:text-white transition-colors rounded-full hover:bg-white/5"
              >
                <Heart className="w-5 h-5" />
              </Link>

              <button
                onClick={openCart}
                className="relative p-2 sm:p-2.5 text-white/70 hover:text-white transition-colors rounded-full hover:bg-white/5 cursor-pointer blur-0"
              >
                <ShoppingBag className="w-5 h-5" />
                <AnimatePresence>
                  {totalItemsCount > 0 && (
                    <motion.span
                      key={totalItemsCount}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-accent text-[10px] font-bold text-white flex items-center justify-center glow-red"
                    >
                      {totalItemsCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              {user ? (
                <div className="relative">
                  <button onClick={() => setProfileOpen(!profileOpen)} className="p-2 sm:p-2.5 text-white/70 hover:text-white transition-colors rounded-full hover:bg-white/5 flex items-center justify-center relative z-[60]">
                    <User className="w-5 h-5" />
                  </button>
                  <AnimatePresence>
                    {profileOpen && (
                      <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setProfileOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55]" />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="absolute top-full right-0 mt-2 w-48 rounded-xl bg-surface border border-white/10 shadow-2xl p-2 z-[60] origin-top-right">
                          <div className="px-4 py-2 border-b border-white/5 mb-2">
                            <p className="text-xs text-white/40" style={{ fontFamily: "'Inter', sans-serif" }}>Signed in as</p>
                            <p className="text-sm font-semibold text-white truncate" style={{ fontFamily: "'Inter', sans-serif" }}>{user.name || user.email}</p>
                          </div>
                          {user.role === 'admin' ? (
                            <>
                              <Link href="/admin" onClick={() => setProfileOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-accent hover:bg-white/5 rounded-lg transition-colors" style={{ fontFamily: "'Inter', sans-serif" }}>
                                Admin Dashboard
                              </Link>
                              <Link href="/admin/settings" onClick={() => setProfileOpen(false)} className="block px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors" style={{ fontFamily: "'Inter', sans-serif" }}>
                                Account Settings
                              </Link>
                            </>
                          ) : (
                            <>
                              <Link href="/profile" onClick={() => setProfileOpen(false)} className="block px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors" style={{ fontFamily: "'Inter', sans-serif" }}>
                                My Profile
                              </Link>
                              <Link href="/orders" onClick={() => setProfileOpen(false)} className="block px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors" style={{ fontFamily: "'Inter', sans-serif" }}>
                                My Orders
                              </Link>
                            </>
                          )}
                          <button onClick={() => { setProfileOpen(false); useAuthStore.getState().logout(); }} className="w-full mt-2 text-left px-4 py-2.5 text-sm text-red-400/80 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
                            Sign Out
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="p-2 sm:p-2.5 text-white/70 hover:text-white transition-colors rounded-full hover:bg-white/5"
                >
                  <User className="w-5 h-5" />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Search bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden border-t border-white/5 bg-background shadow-2xl"
            >
              <div className="mx-auto max-w-2xl px-4 py-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && searchQuery.trim().length >= 2) {
                        window.location.href = `/shop?search=${encodeURIComponent(searchQuery.trim())}`;
                        setSearchOpen(false);
                      }
                    }}
                    placeholder="Search for hoodies, shirts, pants..."
                    autoFocus
                    className="w-full rounded-full bg-white/5 border border-white/10 py-3 pl-12 pr-4 text-sm text-white placeholder:text-white/30 outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  />
                  <button onClick={() => setSearchOpen(false)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Search Results */}
                {searchQuery.trim().length >= 2 && (
                  <div className="mt-4 border-t border-white/10 pt-4 flex flex-col gap-2 max-h-96 overflow-y-auto scrollbar-hide">
                    {isSearching ? (
                      <div className="text-white/50 text-sm text-center py-4">Searching...</div>
                    ) : searchResults.length > 0 ? (
                      <>
                        {searchResults.slice(0, 5).map((product) => {
                          const img = product.images?.find((im: any) => im.isPrimary) || product.images?.[0];
                          const imgSrc = img?.url || img?.imageUrl || '/images/hoodie.jpg';
                          const { min, max } = getProductPriceRange(product);
                          const discount = product.discount || 0;
                          const minD = getDiscountedPrice(min, discount);
                          const maxD = getDiscountedPrice(max, discount);
                          return (
                            <Link 
                              key={product.id} 
                              href={`/shop/${product.id}`} 
                              onClick={() => setSearchOpen(false)} 
                              className="flex items-center gap-4 p-2 rounded-xl hover:bg-white/5 transition-colors"
                            >
                              <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-white/5">
                                <Image src={imgSrc} alt={product.name} fill sizes="48px" className="object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white line-clamp-1">{product.name}</p>
                                <p className="text-xs text-accent font-bold mt-1">{minD === maxD ? `₹${minD.toLocaleString()}` : `₹${minD.toLocaleString()} – ₹${maxD.toLocaleString()}`}</p>
                              </div>
                            </Link>
                          );
                        })}
                        <Link 
                          href={`/shop?search=${encodeURIComponent(searchQuery.trim())}`}
                          onClick={() => setSearchOpen(false)}
                          className="mt-2 py-3 text-center text-[10px] font-black text-accent uppercase tracking-widest hover:bg-accent/10 rounded-xl transition-all border border-accent/20"
                        >
                          View All {searchResults.length} Results
                        </Link>
                      </>
                    ) : (
                      <div className="text-white/50 text-sm text-center py-4">No products found</div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Cart Drawer */}
      <CartDrawer />

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 z-50 h-full w-80 bg-surface border-r border-white/5 p-0 flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <Image
                  src="/images/LOGO.png"
                  alt="SouthZone"
                  width={120}
                  height={36}
                  className="h-7 w-auto rounded"
                />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 text-white/70 hover:text-white bg-white/5 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex flex-col gap-1 p-4 flex-1 overflow-y-auto scrollbar-hide">
                {currentNavLinks.map((link) => (
                  <MobileNavItem 
                    key={link.label} 
                    link={link} 
                    setMobileOpen={setMobileOpen} 
                  />
                ))}
              </nav>

              <div className="p-6 border-t border-white/5 bg-black/20 flex flex-col gap-2 shrink-0">
                <button
                  onClick={() => { setMobileOpen(false); handleFilterToggle(); }}
                  className="flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white rounded-xl hover:bg-white/5 transition-all group w-full"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  <SlidersHorizontal className="w-5 h-5 text-accent/70 group-hover:text-accent" /> 
                  <span className="flex-1 text-left">Refine & Filter</span>
                </button>
                <button
                  onClick={() => { setMobileOpen(false); setSearchOpen(true); }}
                  className="flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white rounded-xl hover:bg-white/5 transition-all group w-full"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  <Search className="w-5 h-5 text-white/40 group-hover:text-white" /> 
                  <span className="flex-1 text-left">Search Products</span>
                </button>
                <Link
                  href="/wishlist"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white rounded-xl hover:bg-white/5 transition-all group"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  <Heart className="w-5 h-5 text-red-500/70 group-hover:text-red-500" /> 
                  <span className="flex-1">Wishlist</span>
                </Link>
                <button
                  onClick={() => { setMobileOpen(false); openCart(); }}
                  className="flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white rounded-xl hover:bg-white/5 transition-all group w-full"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  <ShoppingBag className="w-5 h-5 text-accent/70 group-hover:text-accent" /> 
                  <span className="flex-1 text-left">Shopping Bag</span>
                  {totalItemsCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-accent text-[10px] font-bold text-white glow-red">{totalItemsCount}</span>
                  )}
                </button>
                <Link
                  href={user ? (user.role === 'admin' ? '/admin' : '/profile') : '/auth/login'}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white rounded-xl hover:bg-white/5 transition-all"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  <User className="w-5 h-5 text-accent/70" /> 
                  <span className="flex-1">{user ? 'My Profile' : 'Sign In'}</span>
                </Link>
              </div>
            </motion.aside>
          </>
        )}
        </AnimatePresence>
        </>
      )}
    </>
  );
}