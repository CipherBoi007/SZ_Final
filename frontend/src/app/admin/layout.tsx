'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Package, ShoppingCart, Users, Tag, 
  ChevronLeft, Settings, CreditCard, Megaphone, Star, Monitor,
  Menu, X
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/transactions', label: 'Transactions', icon: CreditCard },
  { href: '/admin/categories', label: 'Categories', icon: Tag },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/coupons', label: 'Coupons', icon: Tag },
  { href: '/admin/promotions', label: 'Promotions', icon: Megaphone },
  { href: '/admin/reviews', label: 'Reviews', icon: Star },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!token || user?.role !== 'admin') {
      router.push('/auth/login');
    }
  }, [token, user, router]);

  if (!token || user?.role !== 'admin') return null;

  return (
    <>
      {/* ─── Mobile Header ─── */}
      <header className="fixed top-0 left-0 right-0 z-40 h-16 bg-surface/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 text-white/70 hover:text-white transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        <span className="font-serif text-base font-black text-white tracking-widest uppercase">Admin Hub</span>
        <Link href="/" className="p-2 text-white/40 hover:text-white transition-colors flex items-center gap-1 text-xs font-black uppercase tracking-wider">
          Store <ChevronLeft className="w-4 h-4 rotate-180" />
        </Link>
      </header>

      {/* ─── Mobile Sidebar Drawer ─── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 z-50 h-full w-72 bg-surface border-r border-white/5 p-6 flex flex-col shadow-2xl lg:hidden"
            >
              <div className="flex items-center justify-between pb-6 border-b border-white/5 mb-6">
                <span className="font-serif text-lg font-black text-white tracking-widest uppercase">Admin Hub</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 text-white/70 hover:text-white bg-white/5 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto no-scrollbar space-y-1">
                {navItems.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                        active 
                          ? 'bg-accent/10 text-accent shadow-[0_0_20px_rgba(220,20,60,0.1)]' 
                          : 'text-white/30 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <item.icon className="w-4 h-4" /> {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="pt-6 border-t border-white/5 mt-auto">
                <Link
                  href="/"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-white/5 border border-white/5 text-[10px] font-black text-white/40 hover:text-white uppercase tracking-widest transition-all"
                >
                  <ChevronLeft className="w-4 h-4" /> Back to Store
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ─── Desktop/Main Layout ─── */}
      <div className="min-h-screen flex pt-16">
        {/* Sidebar — only visible on desktop (lg+) */}
        <aside className="w-60 shrink-0 border-r border-white/5 p-4 hidden lg:block bg-surface/50 backdrop-blur-xl">
          <div className="sticky top-20">
            <Link href="/" className="flex items-center gap-2 text-[10px] font-black text-white/20 uppercase tracking-[0.4em] hover:text-white/60 mb-6 transition-colors">
              <ChevronLeft className="w-3 h-3" /> Back to Store
            </Link>
            <h2 className="text-lg font-serif font-black text-white uppercase tracking-tight mb-6 px-4">Admin Hub</h2>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${active ? 'bg-accent/10 text-accent shadow-[0_0_20px_rgba(220,20,60,0.05)]' : 'text-white/30 hover:text-white hover:bg-white/5'}`}>
                    <item.icon className="w-4 h-4" strokeWidth={1.5} /> {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-4 sm:p-6 pb-6 pt-6 lg:pt-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            {children}
          </motion.div>
        </main>
      </div>
    </>
  );
}

