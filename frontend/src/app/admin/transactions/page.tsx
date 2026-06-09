'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  CreditCard, TrendingUp, TrendingDown, DollarSign, 
  Search, ArrowUpRight, Calendar, User, ShoppingBag,
  Filter, Download, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminAPI } from '@/lib/api';

/* ─── Components ────────────────────────────────────────── */

const StatCard = ({ label, value, icon: Icon, color, subtext }: any) => (
  <div className="p-8 rounded-[32px] glass-strong border border-white/5 relative overflow-hidden group">
    <div className={`absolute -right-8 -bottom-8 w-32 h-32 ${color} opacity-[0.03] blur-2xl group-hover:opacity-[0.07] transition-all duration-700`} />
    <div className="flex items-center gap-6 relative z-10">
      <div className={`w-14 h-14 rounded-2xl ${color.replace('bg-', 'bg-')}/10 border border-white/5 flex items-center justify-center`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
      <div>
        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-1">{label}</p>
        <p className="text-3xl font-serif font-black text-white tracking-tighter">₹{value.toLocaleString()}</p>
        {subtext && <p className="text-[10px] font-black text-white/10 uppercase tracking-widest mt-1">{subtext}</p>}
      </div>
    </div>
  </div>
);

/* ─── Main Page ─────────────────────────────────────────── */

export default function TransactionsLedger() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  async function fetchTransactions() {
    try {
      const { data } = await adminAPI.getTransactions();
      setTransactions(data.data || []);
    } catch {
      toast.error('Financial data sync failed');
    } finally {
      setLoading(false);
    }
  }

  const filtered = transactions.filter(t => 
    t.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
    t.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.user?.email?.toLowerCase().includes(search.toLowerCase())
  );

  const totalCredit = transactions.reduce((acc, t) => acc + t.credit, 0);
  const totalDebit = transactions.reduce((acc, t) => acc + t.debit, 0);
  const netRevenue = totalCredit - totalDebit;

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-black">
      <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      <p className="text-[9px] text-white/20 uppercase tracking-[0.6em]">Syncing Ledger</p>
    </div>
  );

  return (
    <div className="space-y-12">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <h1 className="text-4xl font-serif font-black text-white uppercase tracking-tight mb-2">Transactions</h1>
          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em]">Real-time Boutique Revenue Log</p>
        </div>
        <button onClick={fetchTransactions} className="flex items-center gap-3 px-6 py-3 rounded-2xl glass hover:bg-white/5 text-[10px] font-black text-white uppercase tracking-widest transition-all">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
        <div className="p-4 sm:p-8 rounded-3xl glass-strong border border-white/5 relative overflow-hidden group">
          <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Revenue</p>
          <p className="text-xl sm:text-3xl font-serif font-black text-emerald-400 tracking-tighter">₹{totalCredit.toLocaleString()}</p>
        </div>
        <div className="p-4 sm:p-8 rounded-3xl glass-strong border border-white/5 relative overflow-hidden group">
          <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Refunds</p>
          <p className="text-xl sm:text-3xl font-serif font-black text-red-400 tracking-tighter">₹{totalDebit.toLocaleString()}</p>
        </div>
        <div className="col-span-2 md:col-span-1 p-4 sm:p-8 rounded-3xl glass-strong border border-white/5 relative overflow-hidden group bg-accent/5">
          <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Net Liquidity</p>
          <p className="text-xl sm:text-3xl font-serif font-black text-white tracking-tighter">₹{netRevenue.toLocaleString()}</p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-accent transition-colors" />
          <input 
            type="text"
            placeholder="Search Member or Order..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-14 pr-8 py-4 rounded-2xl glass border border-white/5 text-sm text-white placeholder:text-white/10 focus:border-accent/30 outline-none transition-all"
          />
        </div>
      </div>

      {/* Ledger - Responsive View */}
      <div className="space-y-4 lg:space-y-0">
        {/* Mobile View: High-Density Strips */}
        <div className="lg:hidden space-y-3">
          {filtered.map((t) => (
            <div key={t.id} className="p-5 rounded-2xl glass-strong border border-white/5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center text-[10px] font-black ${
                  t.debit > 0 ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-400'
                }`}>
                  {t.debit > 0 ? 'DR' : 'CR'}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-black text-white uppercase tracking-tight truncate">{t.user?.name || 'Guest'}</p>
                  <p className="text-[9px] text-white/20 font-mono uppercase">#{t.orderNumber} • {new Date(t.date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className={`text-sm font-black font-mono ${t.debit > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {t.debit > 0 ? '-' : '+'}₹{(t.debit || t.credit).toLocaleString()}
                </p>
                <p className="text-[9px] text-white/10 font-mono tracking-tighter">Bal: ₹{t.runningTotal.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View: Ledger Table */}
        <div className="hidden lg:block rounded-[32px] glass-strong border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] border-b border-white/5">
                  <th className="text-left p-8">Date</th>
                  <th className="text-left p-8">Customer</th>
                  <th className="text-left p-8">Order ID</th>
                  <th className="text-left p-8">Type</th>
                  <th className="text-right p-8">Debit</th>
                  <th className="text-right p-8">Credit</th>
                  <th className="text-right p-8">Running Balance</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors group">
                    <td className="p-8">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-3.5 h-3.5 text-white/10" />
                        <span className="text-white/40 font-mono tracking-tighter uppercase">{new Date(t.date).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="p-8">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-black text-white/20 group-hover:text-accent transition-colors">
                          {t.user?.name?.slice(0, 2).toUpperCase() || 'EM'}
                        </div>
                        <span className="text-white/70 font-black uppercase tracking-tight">{t.user?.name || 'Guest Member'}</span>
                      </div>
                    </td>
                    <td className="p-8">
                      <Link href={`/admin/orders/${t.id}`} className="inline-flex items-center gap-2 text-accent/60 hover:text-accent transition-colors font-mono tracking-tighter">
                        #{t.orderNumber} <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </td>
                    <td className="p-8">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        t.debit > 0 ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'
                      }`}>
                        {t.debit > 0 ? 'Debit' : 'Credit'}
                      </span>
                    </td>
                    <td className="p-8 text-right font-mono font-black text-red-400/60">
                      {t.debit > 0 ? `-₹${t.debit.toLocaleString()}` : '—'}
                    </td>
                    <td className="p-8 text-right font-mono font-black text-emerald-400/60">
                      {t.credit > 0 ? `+₹${t.credit.toLocaleString()}` : '—'}
                    </td>
                    <td className="p-8 text-right">
                      <span className="text-lg font-mono font-black text-white tracking-tighter">
                        ₹{t.runningTotal.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filtered.length === 0 && (
          <div className="p-20 text-center space-y-4">
            <CreditCard className="w-12 h-12 text-white/5 mx-auto" />
            <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.6em]">No Transactions Found</p>
          </div>
        )}
      </div>
    </div>
  );
}
