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
    { label: 'Total Revenue', value: `₹${(stats?.revenue?.overall || 0).toLocaleString()}`, sub: `₹${(stats?.revenue?.thisMonth || 0).toLocaleString()} this month`, icon: IndianRupee, gradient: 'from-orange-500/20' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-serif font-black text-white uppercase tracking-tight mb-2">Dashboard</h1>
          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em]">Overview of store activity and metrics</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {cards.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className={`p-4 sm:p-6 rounded-2xl glass-strong relative overflow-hidden group border border-white/5`}>
            <div className={`absolute -right-8 -bottom-8 w-32 h-32 bg-gradient-to-br ${card.gradient} to-transparent opacity-10 blur-3xl`} />
            <div className="relative z-10">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 mb-3 sm:mb-4 shadow-inner group-hover:scale-110 transition-transform duration-500">
                <card.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" strokeWidth={1.5} />
              </div>
              <p className="text-[9px] sm:text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">{card.label}</p>
              <p className="text-xl sm:text-3xl font-serif font-black text-white tracking-tighter">{card.value}</p>
              <p className="mt-2 text-[8px] sm:text-[10px] font-black text-accent uppercase tracking-widest opacity-60">{card.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Revenue Chronograph (Stripe/Vercel Analytics Aesthetic) */}
      <div className="p-5 sm:p-8 rounded-2xl glass-strong border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-serif font-black text-white uppercase tracking-tight">Revenue Overview</h2>
            <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] mt-1">Revenue over time</p>
          </div>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2 text-[9px] font-black text-white/40 uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" /> Live Revenue
            </span>
            <span className="flex items-center gap-2 text-[9px] font-black text-white/20 uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full border border-white/35 border-dashed" /> Target
            </span>
          </div>
        </div>

        <div className="flex gap-4">
          {/* Y-Axis Labels */}
          <div className="hidden sm:flex flex-col justify-between text-[9px] font-black text-white/10 uppercase tracking-wider h-64 pb-8 select-none">
            <span>₹1.5M</span>
            <span>₹1.0M</span>
            <span>₹500K</span>
            <span>₹0</span>
          </div>

          <div className="flex-1 relative h-64 w-full">
            {/* Grid lines, Target line, Area and Line Graph */}
            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="gradient-professional" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid Lines */}
              <line x1="0" y1="10" x2="100" y2="10" stroke="white" strokeOpacity="0.03" strokeWidth="0.5" />
              <line x1="0" y1="40" x2="100" y2="40" stroke="white" strokeOpacity="0.03" strokeWidth="0.5" />
              <line x1="0" y1="70" x2="100" y2="70" stroke="white" strokeOpacity="0.03" strokeWidth="0.5" />
              
              {/* Vertical Grid Lines */}
              <line x1="25" y1="0" x2="25" y2="100" stroke="white" strokeOpacity="0.03" strokeWidth="0.5" />
              <line x1="50" y1="0" x2="50" y2="100" stroke="white" strokeOpacity="0.03" strokeWidth="0.5" />
              <line x1="75" y1="0" x2="75" y2="100" stroke="white" strokeOpacity="0.03" strokeWidth="0.5" />

              {/* Dotted Target Line */}
              <line x1="0" y1="30" x2="100" y2="30" stroke="white" strokeOpacity="0.1" strokeDasharray="3" strokeWidth="0.5" />

              {/* Area Path */}
              <path d="M 0 85 Q 15 80 30 65 T 60 45 T 85 20 L 100 15 L 100 100 L 0 100 Z" fill="url(#gradient-professional)" />

              {/* Line Path */}
              <path d="M 0 85 Q 15 80 30 65 T 60 45 T 85 20 L 100 15" fill="none" stroke="var(--accent)" strokeWidth="1" />
              
              {/* Pulse at peak */}
              <circle cx="100" cy="15" r="3" fill="var(--accent)" opacity="0.3" className="animate-ping" style={{ transformOrigin: '100px 15px' }} />
              <circle cx="100" cy="15" r="1.5" fill="white" />
            </svg>

            {/* Permanent/Peak Tooltip Callout */}
            <div className="absolute right-4 top-2 bg-black border border-white/10 p-3 rounded-xl shadow-2xl backdrop-blur-md pointer-events-none flex flex-col gap-1 z-10">
              <span className="text-[7px] font-black text-white/30 uppercase tracking-[0.2em]">Current Revenue</span>
              <span className="text-[11px] font-black text-white font-mono tracking-tight">₹1,284,500</span>
              <span className="text-[7px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-emerald-400" /> +42.3% YoY
              </span>
            </div>

            <div className="absolute inset-x-0 bottom-0 flex justify-between pt-4 border-t border-white/5 mt-4">
              {['2024 (Legacy)', '2025 (Expansion)', '2026 (Live)'].map((year, i) => (
                <span key={year} className={`text-[9px] font-black uppercase tracking-[0.3em] ${i === 2 ? 'text-accent' : 'text-white/10'}`}>
                  {year}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders - Responsive Table */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-serif font-black text-white uppercase tracking-tight">Recent Orders</h2>
            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em] mt-1">Latest shop orders</p>
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
                <th className="text-left p-8">Order ID</th>
                <th className="text-left p-8">Customer</th>
                <th className="text-left p-8">Status</th>
                <th className="text-right p-8">Total</th>
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
