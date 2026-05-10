'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, Package, Clock, Truck, CheckCircle2, 
  XCircle, FileText, Calendar, ShieldCheck, Zap,
  Printer, ArrowUpRight, ShoppingBag, MapPin, CreditCard,
  Download
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { orderAPI, userAPI } from '@/lib/api';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/* ─── Components ────────────────────────────────────────── */

const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
  pending: { icon: Clock, color: 'text-yellow-500', label: 'PENDING' },
  processing: { icon: Package, color: 'text-blue-500', label: 'PROCESSING' },
  confirmed: { icon: Package, color: 'text-blue-500', label: 'SECURED' },
  shipped: { icon: Truck, color: 'text-purple-500', label: 'EN ROUTE' },
  delivered: { icon: CheckCircle2, color: 'text-emerald-500', label: 'DELIVERED' },
  cancelled: { icon: XCircle, color: 'text-red-500', label: 'CANCELLED' },
};

/* ─── Boutique Invoice (PDF-Engine Optimized) ────────────── */

const InvoiceManifest = ({ order, user, manifestRef }: any) => {
  if (!order) return null;
  const items = order.orderItems || order.OrderItems || [];
  return (
    <div className="absolute left-[-9999px] top-0">
      <div 
        ref={manifestRef}
        id="invoice-manifest" 
        className="p-16 w-[800px]"
        style={{ backgroundColor: '#ffffff', color: '#000000', fontFamily: 'sans-serif' }}
      >
        <div className="flex justify-between items-start mb-20 border-b-2 border-black pb-10" style={{ borderBottomColor: '#000000' }}>
          <div>
            <h1 className="text-5xl font-black tracking-tighter uppercase mb-2" style={{ color: '#000000' }}>SOUTHZONE</h1>
            <p className="text-[10px] font-black uppercase tracking-[0.5em]" style={{ color: '#9ca3af' }}>Official Collection Manifest</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-black uppercase tracking-widest mb-1" style={{ color: '#000000' }}>INVOICE</h2>
            <p className="text-[11px] font-mono" style={{ color: '#9ca3af' }}>#ORD-{order.orderNumber || order.id?.slice(-8).toUpperCase()}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-20 mb-20">
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest mb-4" style={{ color: '#9ca3af' }}>RECIPIENT HUB</h4>
            <p className="text-lg font-black uppercase mb-1" style={{ color: '#000000' }}>{order.shippingAddressSnapshot?.name || user?.name}</p>
            <div className="text-[11px] uppercase leading-relaxed font-medium" style={{ color: '#6b7280' }}>
              <p>{order.shippingAddressSnapshot?.addressLine1}</p>
              <p>{order.shippingAddressSnapshot?.city}, {order.shippingAddressSnapshot?.state} • {order.shippingAddressSnapshot?.pincode}</p>
              <p className="mt-4 font-black" style={{ color: '#000000' }}>CONTACT: {order.phone || order.shippingAddressSnapshot?.phone}</p>
            </div>
          </div>
          <div className="text-right">
            <h4 className="text-[10px] font-black uppercase tracking-widest mb-4" style={{ color: '#9ca3af' }}>DATA LOG</h4>
            <div className="space-y-2 text-[11px] font-black uppercase" style={{ color: '#000000' }}>
              <p className="flex justify-between"><span style={{ color: '#9ca3af' }}>SECURED:</span> <span>{new Date(order.createdAt).toLocaleDateString()}</span></p>
              <p className="flex justify-between"><span style={{ color: '#9ca3af' }}>STATUS:</span> <span>{order.status}</span></p>
              <p className="flex justify-between"><span style={{ color: '#9ca3af' }}>METHOD:</span> <span>{order.paymentMethod}</span></p>
            </div>
          </div>
        </div>

        <table className="w-full mb-16">
          <thead className="border-b-2 border-black" style={{ borderBottomColor: '#000000' }}>
            <tr className="text-left text-[10px] font-black uppercase tracking-[0.4em]" style={{ color: '#000000' }}>
              <th className="py-4">PIECE IDENTIFIER</th>
              <th className="py-4 text-center">QTY</th>
              <th className="py-4 text-right">VALUE</th>
            </tr>
          </thead>
          <tbody className="text-[11px] font-medium uppercase" style={{ color: '#000000' }}>
            {items.map((item: any, i: number) => (
              <tr key={i} className="border-b" style={{ borderBottomColor: '#f3f4f6' }}>
                <td className="py-8">
                  <p className="font-black text-base tracking-tight" style={{ color: '#000000' }}>{item.productSnapshot?.name}</p>
                  <p className="text-[10px] font-black tracking-widest mt-1" style={{ color: '#9ca3af' }}>SIZE: {item.productSnapshot?.size} • COLOR: {item.productSnapshot?.color}</p>
                </td>
                <td className="py-8 text-center font-mono text-base">{item.quantity}</td>
                <td className="py-8 text-right font-black text-base">₹{item.priceAtPurchase?.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end">
          <div className="w-80 space-y-4">
            <div className="flex justify-between text-[11px] font-black uppercase tracking-widest" style={{ color: '#9ca3af' }}>
              <span>SUBTOTAL</span>
              <span style={{ color: '#000000' }}>₹{Number(order.totalAmount || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[11px] font-black uppercase tracking-widest" style={{ color: '#10b981' }}>
              <span>DISCOUNT</span>
              <span>-₹{Number(order.discountAmount || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between pt-6 border-t-2 border-black" style={{ borderTopColor: '#000000' }}>
              <span className="text-[12px] font-black uppercase tracking-[0.2em]" style={{ color: '#000000' }}>TOTAL INVESTMENT</span>
              <span className="text-3xl font-black tracking-tighter" style={{ color: '#000000' }}>₹{Number(order.finalAmount || order.totalAmount).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="mt-40 text-center border-t pt-16" style={{ borderTopColor: '#f3f4f6' }}>
          <div className="flex justify-center mb-6"><ShieldCheck className="w-16 h-16" style={{ color: '#e5e7eb' }} /></div>
          <p className="text-[10px] font-black uppercase tracking-[0.6em]" style={{ color: '#d1d5db' }}>AUTHENTIC SOUTHZONE • QUALITY SECURED</p>
        </div>
      </div>
    </div>
  );
};

/* ─── Main Page ─────────────────────────────────────────── */

export default function OrderDetailPage() {
  const { id } = useParams();
  const { token } = useAuthStore();
  const router = useRouter();
  const manifestRef = useRef<HTMLDivElement>(null);
  
  const [order, setOrder] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!token) { router.push('/auth/login'); return; }
    async function load() {
      try {
        const [orderRes, userRes] = await Promise.all([
          orderAPI.getById(id as string),
          userAPI.getProfile()
        ]);
        setOrder(orderRes.data.data);
        setUser(userRes.data.data?.user || userRes.data.user);
      } catch { toast.error('Order not found'); }
      setLoading(false);
    }
    load();
  }, [id, token, router]);

  const handleDownloadPDF = async () => {
    if (!manifestRef.current) return;
    setDownloading(true);
    const toastId = toast.loading('Synchronizing Official Manifest...');

    try {
      const canvas = await html2canvas(manifestRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [800, canvas.height * (800 / canvas.width)]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, 800, canvas.height * (800 / canvas.width));
      pdf.save(`SouthZone_Manifest_${order.orderNumber || id}.pdf`);
      
      toast.success('Manifest Secured.', { id: toastId });
    } catch (error) {
      console.error('PDF Generation Error:', error);
      toast.error('Manifest Sync Failed.', { id: toastId });
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-black">
      <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      <p className="text-[9px] text-white/20 uppercase tracking-[0.6em]">Accessing Collection</p>
    </div>
  );

  if (!order) return <div className="min-h-screen flex items-center justify-center text-white/20 uppercase tracking-widest font-black">Collection Missing</div>;

  const status = statusConfig[order.status] || statusConfig.pending;
  const items = order.orderItems || [];
  
  // Fulfillment Logic: Prioritize Admin Date > Stored Estimated Date > Fallback Calculation
  const isManualSchedule = !!order.deliveryDate;
  const rawDeliveryDate = order.deliveryDate || order.estimatedDelivery;
  const deliveryDate = rawDeliveryDate ? new Date(rawDeliveryDate) : new Date(order.createdAt);
  if (!rawDeliveryDate) deliveryDate.setDate(deliveryDate.getDate() + 7);

  return (
    <div className="min-h-screen bg-black pt-28 pb-32">
      {/* Hidden Master Manifest (For PDF Engine) */}
      <InvoiceManifest order={order} user={user} manifestRef={manifestRef} />

      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <Link href="/profile" className="inline-flex items-center gap-3 text-[10px] font-black text-white/20 uppercase tracking-[0.4em] hover:text-white transition-all mb-12">
          <ChevronLeft className="w-4 h-4" /> Return to Command Center
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          <div className="lg:col-span-8 space-y-8">
            <div className="p-10 rounded-[32px] bg-white/[0.02] border border-white/5 relative overflow-hidden">
              <ShieldCheck className="absolute -top-12 -right-12 w-48 h-48 text-white/[0.02] -rotate-12" />
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                <div>
                  <p className="text-[10px] font-black text-accent uppercase tracking-[0.5em] mb-3">Collection Secured</p>
                  <h1 className="text-3xl md:text-4xl font-serif font-black text-white uppercase tracking-tight">
                    Order #{order.orderNumber || order.id?.slice(-8).toUpperCase()}
                  </h1>
                </div>
                <div className="flex items-center gap-4 px-6 py-3 rounded-2xl bg-white/[0.03] border border-white/5">
                  <status.icon className={`w-4 h-4 ${status.color}`} />
                  <span className={`text-[10px] font-black uppercase tracking-widest ${status.color}`}>{status.label}</span>
                </div>
              </div>
            </div>

            <div className={`p-10 rounded-[32px] border flex flex-col md:flex-row md:items-center justify-between gap-8 ${
              isManualSchedule ? 'bg-accent/10 border-accent/20' : 'bg-white/[0.02] border-white/5'
            }`}>
              <div className="flex items-center gap-6">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                  isManualSchedule ? 'bg-accent/20' : 'bg-white/5'
                }`}>
                  <Truck className={`w-7 h-7 ${isManualSchedule ? 'text-accent' : 'text-white/40'}`} />
                </div>
                <div>
                  <p className="text-[10px] text-white/20 uppercase tracking-[0.4em] mb-1 font-black">Elite Concierge Delivery</p>
                  <p className="text-xl font-black text-white tracking-tight uppercase">
                    {deliveryDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <div className={`px-4 py-2 rounded-full border flex items-center gap-2 ${
                isManualSchedule ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-white/5 border-white/10'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                  isManualSchedule ? 'bg-emerald-500' : 'bg-white/20'
                }`} />
                <span className={`text-[9px] font-black uppercase tracking-widest ${
                  isManualSchedule ? 'text-emerald-500' : 'text-white/40'
                }`}>
                  {isManualSchedule ? 'Elite Schedule' : 'Estimated Arrival'}
                </span>
              </div>
            </div>

            <div className="p-10 rounded-[32px] bg-white/[0.02] border border-white/5">
              <h2 className="text-lg font-serif font-black text-white uppercase tracking-wider mb-8">Secured Pieces</h2>
              <div className="space-y-6">
                {items.map((item: any) => {
                  const snap = item.productSnapshot || {};
                  return (
                    <div key={item.id} className="flex items-center justify-between group">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center overflow-hidden">
                          <Package className="w-6 h-6 text-white/10" />
                        </div>
                        <div>
                          <Link href={`/shop/${item.productId}`} className="text-base font-black text-white tracking-tight hover:text-accent transition-colors block uppercase">
                            {snap.name || 'Boutique Piece'}
                          </Link>
                          <p className="text-[10px] text-white/20 uppercase tracking-[0.3em] font-black mt-1">
                            {snap.size} • {snap.color} • QTY: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-white tracking-tighter">₹{(item.priceAtPurchase * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <div className="p-10 rounded-[32px] bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-4 mb-6">
                <MapPin className="w-4 h-4 text-accent" />
                <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Delivery Hub</h3>
              </div>
              <p className="text-base font-black text-white uppercase tracking-tight mb-2">{order.shippingAddressSnapshot?.name}</p>
              <div className="text-[11px] text-white/40 uppercase tracking-widest font-black leading-relaxed">
                <p>{order.shippingAddressSnapshot?.addressLine1}</p>
                <p>{order.shippingAddressSnapshot?.city}, {order.shippingAddressSnapshot?.state}</p>
                <p className="mt-4 text-white/10">PH: {order.phone || order.shippingAddressSnapshot?.phone}</p>
              </div>
            </div>

            <div className="p-10 rounded-[32px] bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-4 mb-8">
                <CreditCard className="w-4 h-4 text-accent" />
                <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Financial Summary</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-[11px] font-black text-white/20 uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span className="text-white/60 font-mono tracking-tighter text-sm">₹{Number(order.totalAmount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-[11px] font-black text-emerald-500/50 uppercase tracking-widest">
                  <span>Discount</span>
                  <span className="text-emerald-500 font-mono tracking-tighter text-sm">-₹{Number(order.discountAmount || 0).toLocaleString()}</span>
                </div>
                <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                  <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Total</span>
                  <span className="text-2xl font-black text-white tracking-tighter">₹{Number(order.finalAmount || order.totalAmount).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <button 
                onClick={handleDownloadPDF}
                disabled={downloading}
                className="w-full flex items-center justify-center gap-4 py-6 rounded-[24px] bg-white text-black text-[10px] font-black uppercase tracking-[0.4em] hover:bg-accent hover:text-white transition-all shadow-2xl disabled:opacity-50"
              >
                <Download className="w-4 h-4" /> {downloading ? 'Syncing...' : 'Download Manifest'}
              </button>
              <Link
                href={`/track?order=${order.id}`}
                className="w-full flex items-center justify-center gap-4 py-6 rounded-[24px] bg-white/[0.03] border border-white/5 text-[10px] font-black text-white/40 uppercase tracking-[0.4em] hover:bg-white/5 hover:text-white transition-all"
              >
                <Zap className="w-4 h-4" /> Track Movement
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}