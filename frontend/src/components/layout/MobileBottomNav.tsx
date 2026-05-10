'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Store, Sparkles, ShoppingBag, User } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Mobile Bottom Dock ────────────────────────────────── */

export default function MobileBottomNav() {
  const pathname = usePathname();
  const totalItemsCount = useCartStore((s) => s.items).reduce((acc, item) => acc + item.quantity, 0);
  const { user } = useAuthStore();
  const openCart = useCartStore((s) => s.openCart);

  // Don't show on admin pages
  if (pathname.startsWith('/admin')) return null;

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/shop', label: 'Showroom', icon: Store },
    { href: '/shop?tag=New Drops', label: 'Drops', icon: Sparkles },
    { href: user ? '/profile' : '/auth/login', label: 'Account', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden pointer-events-none">
      {/* Glass Background Dock */}
      <div className="mx-4 mb-6 p-2 rounded-[32px] bg-background/80 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-auto relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-accent/5 to-transparent opacity-50" />
        
        <div className="flex items-center justify-around relative z-10">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link 
                key={item.label} 
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 min-w-[64px] py-2 transition-all duration-500 ${
                  active ? 'text-accent' : 'text-white/30'
                }`}
              >
                <item.icon className={`w-5 h-5 transition-transform ${active ? 'scale-110' : ''}`} />
                <span className="text-[9px] font-black uppercase tracking-widest leading-none">
                  {item.label}
                </span>
                {active && (
                  <motion.div 
                    layoutId="activeDock" 
                    className="absolute -bottom-1 w-1 h-1 rounded-full bg-accent glow-red"
                  />
                )}
              </Link>
            );
          })}

          {/* Special Bag Trigger */}
          <button 
            onClick={openCart}
            className="flex flex-col items-center justify-center gap-1 min-w-[64px] py-2 text-white/30 hover:text-white transition-all relative"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5" />
              <AnimatePresence>
                {totalItemsCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-accent text-[8px] font-black text-white flex items-center justify-center glow-red border border-background"
                  >
                    {totalItemsCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest leading-none">Bag</span>
          </button>
        </div>
      </div>
    </div>
  );
}
