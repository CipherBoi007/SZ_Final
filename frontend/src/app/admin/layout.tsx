'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, Package, ShoppingCart, Users, Tag, 
  ChevronLeft, Settings, CreditCard, Megaphone, Star 
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
    <div className="min-h-screen flex pt-20">
      {/* Sidebar */}
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

      {/* Mobile nav - Scrolling Dock */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden border-t border-white/10 bg-background/90 backdrop-blur-2xl">
        <div className="flex overflow-x-auto no-scrollbar py-2 px-4 gap-2">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href} 
                className={`flex flex-col items-center justify-center gap-1.5 min-w-[70px] px-2 py-3 rounded-xl transition-all ${
                  active ? 'bg-accent/10 text-accent' : 'text-white/20'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-[9px] font-black uppercase tracking-widest leading-none">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 p-4 sm:p-8 pb-24 lg:pb-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          {children}
        </motion.div>
      </main>
    </div>
  );
}
