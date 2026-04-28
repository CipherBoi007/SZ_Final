'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft, Package, Clock, Truck, CheckCircle2, XCircle, Calendar, Save, User, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminAPI, orderAPI } from '@/lib/api';

/* eslint-disable @typescript-eslint/no-explicit-any */

const statusOptions = ['pending', 'processing', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const statusConfig: Record<string, { icon: typeof Clock; color: string }> = {
  pending: { icon: Clock, color: 'text-yellow-400' },
  processing: { icon: Package, color: 'text-blue-400' },
  confirmed: { icon: Package, color: 'text-blue-400' },
  shipped: { icon: Truck, color: 'text-purple-400' },
  delivered: { icon: CheckCircle2, color: 'text-emerald-400' },
  cancelled: { icon: XCircle, color: 'text-red-400' },
};

export default function AdminOrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetch() {
      try {
        const { data } = await orderAPI.getById(id as string);
        setOrder(data.data);
        const dDate = data.data?.deliveryDate || data.data?.estimatedDelivery;
        if (dDate) setDeliveryDate(dDate.split('T')[0]);
      } catch { toast.error('Order not found'); }
      setLoading(false);
    }
    if (id) fetch();
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    try {
      await adminAPI.updateOrderStatus(order.id.toString(), { status: newStatus });
      setOrder({ ...order, status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
    } catch { toast.error('Failed to update status'); }
  };

  const handleSaveDeliveryDate = async () => {
    if (!deliveryDate) return;
    setSaving(true);
    try {
      await adminAPI.updateOrderDeliveryDate(order.id.toString(), { deliveryDate });
      toast.success('Delivery date saved');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  if (!order) return <div className="text-center py-20 text-white/30">Order not found</div>;

  const status = statusConfig[order.status] || statusConfig.pending;
  const StatusIcon = status.icon;
  const items = order.orderItems || [];
  const addr = order.shippingAddressSnapshot || order.shippingAddress;
  const customer = order.user;

  return (
    <div>
      <Link href="/admin/orders" className="flex items-center gap-1 text-sm text-white/30 hover:text-white/60 transition-colors mb-6">
        <ChevronLeft className="w-4 h-4" /> All Orders
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Order #{order.orderNumber || order.id?.slice(0, 8)}</h1>
            <p className="text-sm text-white/30 mt-1">{new Date(order.createdAt).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusIcon className={`w-5 h-5 ${status.color}`} />
            <select value={order.status} onChange={(e) => handleStatusChange(e.target.value)}
              className={`appearance-none px-4 py-2 rounded-xl text-sm font-bold border-0 outline-none cursor-pointer ${status.color} bg-white/5`}>
              {statusOptions.map((s) => <option key={s} value={s} className="bg-surface text-white capitalize">{s}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Items */}
            <div className="p-6 rounded-2xl glass-strong">
              <h2 className="text-base font-bold text-white mb-4">Order Items ({items.length})</h2>
              <div className="space-y-4">
                {items.map((item: any) => {
                  const snapshot = item.productSnapshot || {};
                  const price = Number(item.priceAtPurchase) || 0;
                  return (
                    <div key={item.id} className="flex gap-4 items-center py-2 border-b border-white/5 last:border-0">
                      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                        <Package className="w-4 h-4 text-white/20" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white/80 truncate">{snapshot.name || 'Product'}</p>
                        <p className="text-[10px] text-white/30">{snapshot.size} / {snapshot.color} × {item.quantity}</p>
                      </div>
                      <span className="text-sm font-semibold text-white">₹{(price * item.quantity).toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Delivery Date */}
            <div className="p-6 rounded-2xl glass-strong">
              <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-accent" /> Delivery Date
              </h2>
              <div className="flex items-center gap-3">
                <input type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)}
                  className="py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white outline-none focus:border-accent/50" />
                <button onClick={handleSaveDeliveryDate} disabled={saving}
                  className="px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-semibold transition-all disabled:opacity-50 flex items-center gap-2">
                  {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                  Save
                </button>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Customer */}
            {customer && (
              <div className="p-6 rounded-2xl glass-strong">
                <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2"><User className="w-4 h-4 text-accent" /> Customer</h2>
                <p className="text-sm text-white/70">{customer.name}</p>
                <p className="text-xs text-white/40">{customer.email}</p>
                {customer.phone && <p className="text-xs text-white/40">{customer.phone}</p>}
              </div>
            )}

            {/* Address */}
            {addr && (
              <div className="p-6 rounded-2xl glass-strong">
                <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2"><MapPin className="w-4 h-4 text-accent" /> Shipping</h2>
                <p className="text-sm text-white/60">{addr.name}</p>
                <p className="text-xs text-white/40">{addr.addressLine1}</p>
                <p className="text-xs text-white/40">{addr.city}, {addr.state} - {addr.pincode}</p>
                <p className="text-xs text-white/30 mt-1">Phone: {addr.phone}</p>
              </div>
            )}

            {/* Payment */}
            <div className="p-6 rounded-2xl glass-strong">
              <h2 className="text-base font-bold text-white mb-3">Payment</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-white/50">
                  <span>Subtotal</span><span>₹{Number(order.totalAmount || 0).toLocaleString()}</span>
                </div>
                {Number(order.discountAmount || 0) > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount</span><span>-₹{Number(order.discountAmount).toLocaleString()}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-white/5 flex justify-between text-white font-bold">
                  <span>Total</span><span>₹{Number(order.finalAmount || order.totalAmount || 0).toLocaleString()}</span>
                </div>
                <p className="text-xs text-white/20 mt-2">{order.paymentMethod?.toUpperCase()} • {order.paymentStatus}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
