'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Package, ShoppingBag, IndianRupee, Clock, ShoppingCart, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminAPI } from '@/lib/api';
import Link from 'next/link';

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const { data } = await adminAPI.getDashboard();
        setStats(data.data);
      } catch { 
        toast.error('Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;

  const cards = [
    { label: 'Total Users', value: stats?.users?.total || 0, sub: `+${stats?.users?.newThisMonth || 0} this month`, icon: Users, gradient: 'from-blue-500/20' },
    { label: 'Products', value: stats?.products || 0, sub: 'Active listings', icon: Package, gradient: 'from-emerald-500/20' },
    { label: 'Orders', value: stats?.orders?.total || 0, sub: `${stats?.orders?.thisMonth || 0} this month`, icon: ShoppingBag, gradient: 'from-purple-500/20' },
    { label: 'Overall Revenue', value: `₹${(stats?.revenue?.overall || 0).toLocaleString()}`, sub: `₹${(stats?.revenue?.thisMonth || 0).toLocaleString()} this month`, icon: IndianRupee, gradient: 'from-orange-500/20' },
  ];

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <h1 className="text-4xl font-serif font-black text-white uppercase tracking-tight mb-2">Executive Hub</h1>
          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em]">Real-time Boutique Performance Intelligence</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
        {cards.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className={`p-4 sm:p-8 rounded-3xl glass-strong relative overflow-hidden group border border-white/5`}>
            <div className={`absolute -right-8 -bottom-8 w-32 h-32 bg-gradient-to-br ${card.gradient} to-transparent opacity-10 blur-3xl`} />
            <div className="relative z-10">
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 mb-4 sm:mb-6 shadow-inner group-hover:scale-110 transition-transform duration-500">
                <card.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" strokeWidth={1.5} />
              </div>
              <p className="text-[9px] sm:text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">{card.label}</p>
              <p className="text-xl sm:text-3xl font-serif font-black text-white tracking-tighter">{card.value}</p>
              <p className="mt-2 text-[8px] sm:text-[10px] font-black text-accent uppercase tracking-widest opacity-60">{card.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Revenue Chronograph Mockup (Using SVG for maximum speed) */}
      <div className="p-8 sm:p-12 rounded-[40px] glass-strong border border-white/5 relative overflow-hidden">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-2xl font-serif font-black text-white uppercase tracking-tight">Revenue Chronograph</h2>
            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em] mt-1">3-Year Performance Trajectory</p>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            <span className="flex items-center gap-2 text-[10px] font-black text-white/40 uppercase tracking-widest"><div className="w-2 h-2 rounded-full bg-accent" /> Growth</span>
          </div>
        </div>
        <div className="relative h-64 w-full">
          {/* Simple SVG Chart representing 3 years of data points */}
          <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.2" />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M 0 80 Q 25 75 50 40 T 100 20 L 100 100 L 0 100 Z" fill="url(#gradient)" />
            <path d="M 0 80 Q 25 75 50 40 T 100 20" fill="none" stroke="var(--accent)" strokeWidth="0.5" />
            <circle cx="0" cy="80" r="1" fill="var(--accent)" />
            <circle cx="25" cy="75" r="1" fill="var(--accent)" />
            <circle cx="50" cy="40" r="1" fill="var(--accent)" />
            <circle cx="75" cy="30" r="1" fill="var(--accent)" />
            <circle cx="100" cy="20" r="1" fill="var(--accent)" />
          </svg>
          <div className="absolute inset-x-0 bottom-0 flex justify-between pt-4 border-t border-white/5 mt-4">
             {['2024 (Legacy)', '2025 (Expansion)', '2026 (Live)'].map(year => (
               <span key={year} className="text-[9px] font-black text-white/10 uppercase tracking-[0.3em]">{year}</span>
             ))}
          </div>
        </div>
      </div>

      {/* Recent Orders - Responsive Table */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-serif font-black text-white uppercase tracking-tight">Recent Activity</h2>
            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em] mt-1">Live fulfillment Stream</p>
          </div>
          <Link href="/admin/orders" className="px-6 py-2.5 rounded-full border border-white/10 text-[10px] font-black text-white/40 hover:text-white hover:bg-white/5 uppercase tracking-[0.2em] transition-all">
            See All
          </Link>
        </div>

        <div className="space-y-3 sm:space-y-0 sm:rounded-[32px] sm:glass-strong sm:border sm:border-white/5 sm:overflow-hidden">
          {/* Mobile View: Strips */}
          <div className="sm:hidden space-y-3">
            {(stats?.recentOrders || []).map((order: any) => (
              <div key={order.id} className="p-5 rounded-2xl glass-strong border border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-black text-white uppercase tracking-tight">#{order.orderNumber || order.id.slice(0,8)}</p>
                  <p className="text-[9px] text-white/20 font-mono uppercase mt-0.5">{order.user?.name || 'Guest'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-white mb-1">₹{(order.finalAmount || order.totalAmount)?.toLocaleString()}</p>
                  <span className={`text-[8px] font-black uppercase tracking-widest ${
                    order.status === 'delivered' ? 'text-emerald-400' : 'text-yellow-400'
                  }`}>{order.status}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] border-b border-white/5">
                <th className="text-left p-8">Order Portal</th>
                <th className="text-left p-8">Member</th>
                <th className="text-left p-8">Current State</th>
                <th className="text-right p-8">Capital</th>
              </tr></thead>
              <tbody>
                {(stats?.recentOrders || []).map((order: any) => (
                  <tr key={order.id} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors">
                    <td className="p-8">
                      <div className="flex items-center gap-3">
                        <ShoppingCart className="w-4 h-4 text-white/10" />
                        <span className="text-white font-black uppercase tracking-tighter">#{order.orderNumber || order.id.slice(0,8)}</span>
                      </div>
                    </td>
                    <td className="p-8 text-white/50 font-medium uppercase tracking-tight">{order.user?.name || '—'}</td>
                    <td className="p-8">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        order.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-400'
                      }`}>{order.status}</span>
                    </td>
                    <td className="p-8 text-right text-white font-black font-mono">₹{(order.finalAmount || order.totalAmount)?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
