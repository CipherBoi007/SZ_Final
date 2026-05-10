'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, Package, ArrowRight, ShoppingBag, 
  Truck, Download, Clock, Zap, ShieldCheck, 
  ArrowUpRight, ClipboardCheck, Printer
} from 'lucide-react';
import toast from 'react-hot-toast';
import { userAPI } from '@/lib/api';
import { formatDeliveryDate } from '@/lib/utils';

/* ─── Components ────────────────────────────────────────── */

const DataRow = ({ icon: Icon, label, value, color = "white/20" }: any) => (
  <div className="flex items-center justify-between py-4 border-b border-white/[0.03]">
    <div className="flex items-center gap-3">
      <Icon className={`w-3.5 h-3.5 text-${color === 'white/20' ? 'accent' : 'white/40'}`} />
      <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">{label}</span>
    </div>
    <span className="text-[11px] font-black text-white tracking-widest uppercase">{value}</span>
  </div>
);

/* ─── Boutique Invoice Manifest (Print View) ─────────────── */

const InvoiceManifest = ({ order, user }: any) => {
  if (!order) return null;
  const items = order.orderItems || order.OrderItems || [];
  return (
    <div id="invoice-manifest" className="bg-white text-black p-12 font-sans hidden print:block min-h-screen">
      <div className="flex justify-between items-start mb-16">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase mb-1">SOUTHZONE</h1>
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-400">Official Collection Manifest</p>
        </div>
        <div className="text-right">
          <h2 className="text-lg font-black uppercase tracking-widest">INVOICE</h2>
          <p className="text-[10px] font-mono text-gray-400">#{order.orderNumber}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-12 mb-16">
        <div>
          <h4 className="text-[9px] font-black uppercase tracking-widest text-gray-300 mb-2">RECIPIENT</h4>
          <p className="text-md font-black uppercase">{order.shippingAddressSnapshot?.name || user?.name}</p>
          <p className="text-[10px] text-gray-500 uppercase leading-relaxed">{order.shippingAddressSnapshot?.addressLine1}, {order.shippingAddressSnapshot?.city}</p>
        </div>
        <div className="text-right">
          <h4 className="text-[9px] font-black uppercase tracking-widest text-gray-300 mb-2">DETAILS</h4>
          <p className="text-[10px] font-black uppercase">DATE: {new Date(order.createdAt).toLocaleDateString()}</p>
          <p className="text-[10px] font-black uppercase">METHOD: {order.paymentMethod}</p>
        </div>
      </div>
      <table className="w-full mb-12">
        <thead className="border-b border-black">
          <tr className="text-left text-[9px] font-black uppercase tracking-widest">
            <th className="py-2">ITEM</th>
            <th className="py-2 text-center">QTY</th>
            <th className="py-2 text-right">PRICE</th>
          </tr>
        </thead>
        <tbody className="text-[10px] font-medium uppercase">
          {items.map((item: any, i: number) => (
            <tr key={i} className="border-b border-gray-100">
              <td className="py-4 font-black">{item.productSnapshot?.name}</td>
              <td className="py-4 text-center">{item.quantity}</td>
              <td className="py-4 text-right">₹{item.priceAtPurchase?.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-end">
        <div className="w-48 space-y-2">
          <div className="flex justify-between text-[10px] font-black">
            <span className="text-gray-400">TOTAL</span>
            <span>₹{order.totalAmount?.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Success Content ───────────────────────────────────── */

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (!orderId) return;
    const loadData = async () => {
      try {
        const [orderRes, userRes] = await Promise.all([
          userAPI.getOrder(orderId),
          userAPI.getProfile()
        ]);
        setOrder(orderRes.data?.data || orderRes.data);
        setUser(userRes.data?.data?.user || userRes.data?.user);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    loadData();
  }, [orderId]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center gap-4 py-32">
      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      <p className="text-[9px] text-white/20 uppercase tracking-[0.5em] font-black">Validating Collection</p>
    </div>
  );

  const itemCount = order?.orderItems?.length || order?.OrderItems?.length || 0;

  return (
    <div className="max-w-lg mx-auto px-4 w-full relative z-10">
      <InvoiceManifest order={order} user={user} />

      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-[#0A0A0A] border border-white/[0.05] rounded-[32px] p-10 md:p-12 shadow-2xl relative overflow-hidden"
      >
        {/* Subtle Branding Watermark */}
        <ShieldCheck className="absolute -top-10 -right-10 w-48 h-48 text-white/[0.02] -rotate-12" />

        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 mx-auto mb-8 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-accent" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-serif font-black text-white uppercase tracking-tight mb-3">Collection Secured</h1>
          <p className="text-[10px] text-white/20 uppercase tracking-[0.4em] font-black leading-relaxed max-w-xs mx-auto">
            Your pieces are now reserved within the SouthZone vault.
          </p>
        </div>

        {/* Quick ID Badge */}
        <div className="flex justify-center mb-12">
          <div className="px-6 py-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-4">
            <Zap className="w-3.5 h-3.5 text-accent" />
            <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">Vault ID</span>
            <span className="text-xs font-black text-white tracking-widest">{order?.orderNumber || orderId?.toString().slice(-8).toUpperCase()}</span>
          </div>
        </div>

        {/* Data Matrix - Tightened */}
        <div className="space-y-1 mb-12">
          <DataRow icon={Clock} label="Time" value={new Date(order?.createdAt || Date.now()).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} />
          <DataRow icon={Package} label="Pieces" value={`${itemCount} Products`} />
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-3.5 h-3.5 text-accent" />
              <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">Investment</span>
            </div>
            <span className="text-2xl font-black text-white tracking-tighter">₹{(order?.totalAmount || 0).toLocaleString()}</span>
          </div>
        </div>

        {/* Next Step Logic */}
        {order?.estimatedDelivery && (
          <div className="p-6 rounded-2xl bg-accent/[0.03] border border-accent/10 mb-12 flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Truck className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-[9px] text-white/20 uppercase tracking-[0.4em] mb-0.5 font-black">Est. Movement</p>
                <p className="text-sm font-black text-white uppercase tracking-tight">{formatDeliveryDate(order.estimatedDelivery)}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/5 border border-emerald-500/10">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Active</span>
            </div>
          </div>
        )}

        {/* Unified Action Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/profile?tab=orders" className="flex items-center justify-center gap-3 py-5 rounded-2xl bg-white/[0.03] border border-white/5 text-[9px] font-black text-white/30 uppercase tracking-[0.3em] hover:text-white transition-all">
            <ClipboardCheck className="w-4 h-4" /> Track
          </Link>
          <Link href="/shop" className="flex items-center justify-center gap-3 py-5 rounded-2xl bg-white text-black text-[9px] font-black uppercase tracking-[0.3em] hover:bg-accent hover:text-white transition-all shadow-xl">
            Showroom <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Subtle Invoice Link */}
        <button onClick={() => window.print()} className="w-full mt-10 text-[9px] font-black text-white/10 uppercase tracking-[0.5em] hover:text-white/40 transition-all flex items-center justify-center gap-2">
          <Printer className="w-3 h-3" /> Get Official Manifest
        </button>
      </motion.div>
    </div>
  );
}

/* ─── Page Wrapper ─────────────────────────────────────── */

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-black pt-32 pb-40 relative flex items-center justify-center overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/[0.03] blur-[120px] rounded-full" />
      </div>
      <Suspense fallback={<div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}