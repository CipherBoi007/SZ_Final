'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft, User, Mail, Phone, Shield, ShoppingBag, Calendar, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminAPI } from '@/lib/api';

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function AdminUserDetail() {
  const { id } = useParams();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const { data } = await adminAPI.getUser(id as string);
        setUser(data.data);
      } catch { toast.error('User not found'); }
      setLoading(false);
    }
    if (id) fetch();
  }, [id]);

  const handlePromote = async () => {
    if (!confirm('Promote this user to admin?')) return;
    try {
      await adminAPI.promoteUser(user.id.toString());
      setUser({ ...user, role: 'admin' });
      toast.success('User promoted to admin');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to promote');
    }
  };

  const handleDeactivate = async () => {
    if (!confirm('Deactivate this user?')) return;
    try {
      await adminAPI.deactivateUser(user.id.toString());
      setUser({ ...user, isActive: false });
      toast.success('User deactivated');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to deactivate');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <div className="text-center py-20 text-white/30">User not found</div>;

  return (
    <div>
      <Link href="/admin/customers" className="flex items-center gap-1 text-sm text-white/30 hover:text-white/60 transition-colors mb-6">
        <ChevronLeft className="w-4 h-4" /> All Customers
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-6 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-accent-hover p-[2px]">
            <div className="w-full h-full rounded-2xl bg-surface flex items-center justify-center text-2xl font-bold text-white">
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{user.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                user.role === 'admin' ? 'bg-accent/10 text-accent' : 'bg-white/5 text-white/40'
              }`}>{user.role}</span>
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                user.isActive !== false ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
              }`}>{user.isActive !== false ? 'Active' : 'Inactive'}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl glass-strong">
            <h2 className="text-base font-bold text-white mb-4">Account Details</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-white/30" />
                <div>
                  <p className="text-xs text-white/30">Email</p>
                  <p className="text-sm text-white/70">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-white/30" />
                <div>
                  <p className="text-xs text-white/30">Phone</p>
                  <p className="text-sm text-white/70">{user.phone || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-white/30" />
                <div>
                  <p className="text-xs text-white/30">Joined</p>
                  <p className="text-sm text-white/70">{new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
              {user.lastLogin && (
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-white/30" />
                  <div>
                    <p className="text-xs text-white/30">Last Login</p>
                    <p className="text-sm text-white/70">{new Date(user.lastLogin).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-2xl glass-strong">
              <h2 className="text-base font-bold text-white mb-4">Quick Stats</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/5 text-center">
                  <ShoppingBag className="w-5 h-5 mx-auto text-white/30 mb-2" />
                  <p className="text-xl font-bold text-white">{user.ordersCount || user.orders?.length || '—'}</p>
                  <p className="text-[10px] text-white/30">Orders</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 text-center">
                  <Star className="w-5 h-5 mx-auto text-white/30 mb-2" />
                  <p className="text-xl font-bold text-white">{user.reviewsCount || user.reviews?.length || '—'}</p>
                  <p className="text-[10px] text-white/30">Reviews</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 rounded-2xl glass-strong">
              <h2 className="text-base font-bold text-white mb-4">Actions</h2>
              <div className="flex flex-col gap-3">
                {user.role !== 'admin' && (
                  <button onClick={handlePromote} className="flex items-center justify-center gap-2 py-3 rounded-xl bg-accent/10 text-accent text-sm font-semibold hover:bg-accent hover:text-white transition-all">
                    <Shield className="w-4 h-4" /> Promote to Admin
                  </button>
                )}
                {user.isActive !== false && (
                  <button onClick={handleDeactivate} className="flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 text-red-400 text-sm font-semibold hover:bg-red-500 hover:text-white transition-all">
                    Deactivate Account
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
