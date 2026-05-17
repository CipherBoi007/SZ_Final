'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, Package, ShoppingCart, Users, Tag, 
  ChevronLeft, Settings, CreditCard, Megaphone, Star, Monitor 
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const navItems = [
  { href: '/admin', label: 'Executive Hub', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Showroom', icon: Package },
  { href: '/admin/orders', label: 'Fulfillment', icon: ShoppingCart },
  { href: '/admin/transactions', label: 'Revenue Stream', icon: CreditCard },
  { href: '/admin/categories', label: 'Hierarchy', icon: Tag },
  { href: '/admin/customers', label: 'Member Registry', icon: Users },
  { href: '/admin/coupons', label: 'Exclusive Vault', icon: Tag },
  { href: '/admin/promotions', label: 'Global Campaigns', icon: Megaphone },
  { href: '/admin/reviews', label: 'Social Proof', icon: Star },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!token || user?.role !== 'admin') {
      router.push('/auth/login');
    }
  }, [token, user, router]);

  if (!token || user?.role !== 'admin') return null;

  return (
    <>
      {/* ─── Mobile/Tablet Blocker — Admin is desktop-only ─── */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center lg:hidden" style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
        <div className="absolute inset-0 bg-black/80" />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }} 
          className="relative z-10 flex flex-col items-center text-center px-8 py-12 mx-4 rounded-3xl border border-white/10 bg-surface/90 max-w-sm"
        >
          <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-6">
            <Monitor className="w-8 h-8 text-accent" />
          </div>
          <h2 className="font-serif text-xl font-bold text-white mb-3">Desktop Only</h2>
          <p className="text-sm text-white/50 leading-relaxed mb-6">
            The Admin Dashboard requires a desktop screen for the best experience. 
            Please open this page on a laptop or desktop computer.
          </p>
          <div className="text-[10px] text-white/20 uppercase tracking-[0.3em] font-bold">
            Minimum: 1024px width
          </div>
          <Link 
            href="/" 
            className="mt-8 px-8 py-3 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-semibold transition-all"
          >
            Back to Store
          </Link>
        </motion.div>
      </div>

      {/* ─── Desktop Layout ─── */}
      <div className="min-h-screen flex pt-20">
        {/* Sidebar — only visible on desktop (lg+) */}
        <aside className="w-64 shrink-0 border-r border-white/5 p-4 hidden lg:block bg-surface/50 backdrop-blur-xl">
          <div className="sticky top-24">
            <Link href="/" className="flex items-center gap-2 text-[10px] font-black text-white/20 uppercase tracking-[0.4em] hover:text-white/60 mb-8 transition-colors">
              <ChevronLeft className="w-3 h-3" /> Back to Store
            </Link>
            <h2 className="text-xl font-serif font-black text-white uppercase tracking-tight mb-8 px-4">Admin Hub</h2>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href}
                    className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${active ? 'bg-accent/10 text-accent shadow-[0_0_20px_rgba(220,20,60,0.1)]' : 'text-white/30 hover:text-white hover:bg-white/5'}`}>
                    <item.icon className="w-4 h-4" /> {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main content — desktop only */}
        <main className="flex-1 p-4 sm:p-8 pb-8">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            {children}
          </motion.div>
        </main>
      </div>
    </>
  );
}

