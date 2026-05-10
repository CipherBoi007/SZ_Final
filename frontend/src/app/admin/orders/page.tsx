'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ShoppingCart, ShoppingBag, Clock, Truck, CheckCircle2, XCircle, Package, Calendar, Save, CalendarCheck, AlertCircle, ChevronLeft, ChevronRight, RefreshCcw, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminAPI } from '@/lib/api';

/* eslint-disable @typescript-eslint/no-explicit-any */

const statusOptions = ['pending', 'processing', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-400',
  processing: 'bg-blue-500/10 text-blue-400',
  confirmed: 'bg-blue-500/10 text-blue-400',
  shipped: 'bg-purple-500/10 text-purple-400',
  delivered: 'bg-emerald-500/10 text-emerald-400',
  cancelled: 'bg-red-500/10 text-red-400',
};

const statusIcons: Record<string, any> = {
  pending: Clock,
  processing: Package,
  confirmed: CheckCircle2,
  shipped: Truck,
  delivered: CheckCircle2,
  cancelled: XCircle,
};

const mapStatusToLabel = (status: string) => {
  if (status === 'pending') return 'Ordered';
  if (status === 'confirmed') return 'Ordered (Confirmed)';
  if (status === 'processing') return 'Out for Delivery';
  return status;
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [deliveryDates, setDeliveryDates] = useState<Record<string, string>>({});
  const [updating, setUpdating] = useState<Record<string, boolean>>({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchOrders(page);
  }, [page]);

  async function fetchOrders(currentPage: number) {
    setLoading(true);
    try {
      const { data } = await adminAPI.getOrders({ page: currentPage, limit: 10 });
      const payload = data.data;
      setOrders(payload || []);
      setTotalPages(data.pages || 1);
      
      const initialDates: Record<string, string> = {};
      (payload || []).forEach((order: any) => {
        const dDate = order.deliveryDate || order.estimatedDelivery;
        if (dDate) {
          initialDates[order.id] = dDate.split('T')[0];
        }
      });
      setDeliveryDates(initialDates);
    } catch { 
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await adminAPI.updateOrderStatus(orderId, { status: newStatus });
      setOrders(orders.map((o) => o.id.toString() === orderId ? { ...o, status: newStatus } : o));
      toast.success(`Order updated to ${newStatus}`);
    } catch { toast.error('Failed to update'); }
  };

  const handleDeliveryDateChange = (orderId: string, date: string) => {
    setDeliveryDates(prev => ({ ...prev, [orderId]: date }));
  };

  const handleSaveDeliveryDate = async (orderId: string) => {
    const deliveryDate = deliveryDates[orderId];
    if (!deliveryDate) {
      toast.error('Please select a delivery date');
      return;
    }
    
    setUpdating(prev => ({ ...prev, [orderId]: true }));
    try {
      await adminAPI.updateOrderDeliveryDate(orderId, { deliveryDate });
      setOrders(orders.map((o) => 
        o.id.toString() === orderId ? { ...o, estimatedDelivery: deliveryDate, deliveryDate } : o
      ));
      toast.success('Delivery date updated');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update delivery date');
    } finally {
      setUpdating(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    };
    return date.toLocaleDateString('en-IN', options);
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 14);
    return maxDate.toISOString().split('T')[0];
  };

  const getDeliveryStatus = (deliveryDate: string) => {
    if (!deliveryDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const delDate = new Date(deliveryDate);
    delDate.setHours(0, 0, 0, 0);
    
    if (delDate < today) return { text: 'Delayed', color: 'text-red-400', icon: AlertCircle };
    if (delDate.getTime() === today.getTime()) return { text: 'Today', color: 'text-yellow-400', icon: Calendar };
    return { text: 'Upcoming', color: 'text-emerald-400', icon: CalendarCheck };
  };

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">Orders</h1>

      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 pb-2">
        {['all', ...statusOptions].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-medium transition-all capitalize flex items-center gap-1.5 ${
              filter === s ? 'bg-accent text-white' : 'glass text-white/50 hover:text-white'
            }`}>
            {s !== 'all' && statusIcons[s] && (() => {
              const Icon = statusIcons[s];
              return <Icon className="w-3 h-3" />;
            })()}
            {s !== 'all' ? mapStatusToLabel(s) : s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="space-y-4">
          {/* Mobile View: Cards */}
          <div className="sm:hidden space-y-4">
            {filtered.map((order) => {
              const StatusIcon = statusIcons[order.status] || Package;
              let dateToCheck = order.deliveryDate || order.estimatedDelivery;
              if (!dateToCheck && order.createdAt) {
                const fallbackDate = new Date(order.createdAt);
                fallbackDate.setDate(fallbackDate.getDate() + 7);
                dateToCheck = fallbackDate.toISOString();
              }
              const deliveryStatus = getDeliveryStatus(dateToCheck);
              
              return (
                <motion.div 
                  key={order.id} 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-strong rounded-2xl border border-white/10 overflow-hidden"
                >
                  <div className="p-5 space-y-5">
                    {/* Header: ID & Status */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-white/90 uppercase tracking-widest">#{order.orderNumber || order.id}</span>
                      <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${statusColors[order.status]}`}>
                        <StatusIcon className="w-3 h-3" />
                        {mapStatusToLabel(order.status)}
                      </div>
                    </div>

                    {/* Customer & Date */}
                    <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5">
                      <div>
                        <p className="text-[10px] text-white/20 uppercase tracking-widest mb-1">Customer</p>
                        <p className="text-xs font-bold text-white/70 truncate">{order.user?.name || order.user?.email || '—'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-white/20 uppercase tracking-widest mb-1">Order Date</p>
                        <p className="text-xs font-bold text-white/70">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {/* Delivery Chronograph */}
                    <div className="bg-white/[0.02] rounded-xl p-4 border border-white/5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-accent" />
                          <span className="text-[11px] font-black text-white tracking-widest uppercase">
                            {dateToCheck ? new Date(dateToCheck).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'NOT SET'}
                          </span>
                        </div>
                        {deliveryStatus && (
                          <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${deliveryStatus.color}`}>
                            {deliveryStatus.text}
                          </span>
                        )}
                      </div>
                      <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                        <div className="h-full bg-accent w-1/2" />
                      </div>
                    </div>

                    {/* Footer: Amount & Actions */}
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-lg font-black text-white">₹{(order.finalAmount || order.totalAmount)?.toLocaleString()}</span>
                      <Link 
                        href={`/admin/orders/${order.id}`}
                        className="px-6 py-2.5 rounded-xl bg-white/5 text-white text-[10px] font-black uppercase tracking-widest border border-white/10"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Desktop View: Table */}
          <div className="hidden sm:block rounded-2xl glass-strong overflow-hidden">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-sm whitespace-nowrap">
                <thead>
                  <tr className="text-white/30 border-b border-white/5">
                    <th className="text-left p-4 font-medium">Order</th>
                    <th className="text-left p-4 font-medium">Customer</th>
                    <th className="text-left p-4 font-medium">Date</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium">Delivery Date</th>
                    <th className="text-left p-4 font-medium">Amount</th>
                    <th className="text-right p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((order) => {
                    const StatusIcon = statusIcons[order.status] || Package;
                    let dateToCheck = order.deliveryDate || order.estimatedDelivery;
                    if (!dateToCheck && order.createdAt) {
                      const fallbackDate = new Date(order.createdAt);
                      fallbackDate.setDate(fallbackDate.getDate() + 7);
                      dateToCheck = fallbackDate.toISOString();
                    }
                    
                    const deliveryStatus = getDeliveryStatus(dateToCheck);
                    
                    return (
                      <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="text-white/70">#{order.orderNumber || order.id}</span>
                          </div>
                        </td>
                        <td className="p-4 text-white/50">
                          {order.user?.name || order.user?.email || '—'}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-white/30" />
                            <span className="text-white/40">{new Date(order.createdAt).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5">
                            <StatusIcon className="w-3.5 h-3.5" />
                            <select 
                              value={order.status} 
                              onChange={(e) => handleStatusChange(order.id.toString(), e.target.value)}
                              disabled={['cancelled', 'refunded'].includes(order.status)}
                              className={`appearance-none px-3 py-1.5 rounded-lg text-[14px] font-bold border-0 outline-none cursor-pointer ${statusColors[order.status] || 'text-white/50'} bg-transparent disabled:opacity-80 disabled:cursor-not-allowed`}
                            >
                              {statusOptions.map((s) => (
                                <option key={s} value={s} className="bg-surface text-white capitalize">{mapStatusToLabel(s)}</option>
                              ))}
                            </select>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5 text-accent" />
                              <span className="text-[12px] font-black text-white tracking-widest uppercase">
                                {dateToCheck ? new Date(dateToCheck).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'NOT SET'}
                              </span>
                            </div>
                            
                            {deliveryStatus && (
                              <div className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${deliveryStatus.color.replace('text-', 'bg-')} shadow-[0_0_8px_rgba(255,255,255,0.2)]`} />
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${deliveryStatus.color}/70`}>
                                  {deliveryStatus.text}
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-white font-medium">
                            ₹{(order.finalAmount || order.totalAmount)?.toLocaleString()}
                          </span>
                        </td>
                        <td className="p-4 text-right text-[12px]">
                          <div className="flex items-center justify-end gap-2">
                            {order.status === 'cancelled' && order.paymentStatus === 'completed' ? (
                              <button 
                                onClick={async () => {
                                  if (!confirm('Authorize capital exit? This will trigger a direct Razorpay refund.')) return;
                                  const t = toast.loading('Initiating Razorpay Refund...');
                                  try {
                                    await adminAPI.processRefund(order.id.toString());
                                    toast.success('Refund Authorized. Capital returned.', { id: t });
                                    fetchOrders(page);
                                  } catch (err: any) {
                                    toast.error(err.response?.data?.message || 'Refund Failed', { id: t });
                                  }
                                }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all text-[10px] font-black uppercase tracking-widest border border-red-500/20"
                              >
                                <RefreshCcw className="w-3.5 h-3.5" /> Process Refund
                              </button>
                            ) : order.paymentStatus === 'refunded' ? (
                              <span className="px-4 py-2 rounded-xl bg-white/5 text-white/30 text-[10px] font-black uppercase tracking-widest border border-white/5">
                                Refunded
                              </span>
                            ) : (
                              <Link 
                                href={`/admin/orders/${order.id}`}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest border border-white/5"
                              >
                                <ExternalLink className="w-3.5 h-3.5" /> View Manifest
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          {filtered.length === 0 && (
            <div className="p-8 text-center text-white/20">
              <ShoppingBag className="w-8 h-8 mx-auto mb-2" />
              <p>No orders found</p>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-6 border-t border-white/5 bg-white/[0.01] flex items-center justify-between">
              <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))} 
                  disabled={page === 1}
                  className="p-3 rounded-xl glass border border-white/5 text-white disabled:opacity-20 hover:bg-white/5 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                  disabled={page === totalPages}
                  className="p-3 rounded-xl glass border border-white/5 text-white disabled:opacity-20 hover:bg-white/5 transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}