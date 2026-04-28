'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tag, Clock, Percent, IndianRupee, Copy, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { couponAPI } from '@/lib/api';

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    async function fetch() {
      try {
        const { data } = await couponAPI.getAll();
        const all = data.data || [];
        setCoupons(all.filter((c: any) => c.isActive && c.isPublic));
      } catch { /* fallback */ }
      setLoading(false);
    }
    fetch();
  }, []);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    toast.success(`Copied: ${code}`);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen pt-24 lg:pt-28 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <span className="text-accent text-xs font-semibold tracking-[0.2em] uppercase flex items-center justify-center gap-2">
            <Tag className="w-4 h-4" /> Save More
          </span>
          <h1 className="mt-3 text-3xl sm:text-4xl font-bold gradient-text">Available Coupons</h1>
          <p className="mt-3 text-white/40 max-w-md mx-auto">Apply these codes at checkout to save on your order</p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-20">
            <Tag className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <p className="text-white/30 text-lg">No coupons available right now</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {coupons.map((coupon, i) => {
              const isExpiring = coupon.endDate && new Date(coupon.endDate).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000;
              return (
                <motion.div key={coupon.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                  className="p-6 rounded-2xl glass glass-hover border border-white/5 hover:border-accent/20 transition-all relative overflow-hidden">
                  {/* Decorative corner */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-accent/5 rounded-bl-[50%]" />
                  
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      {coupon.discountType === 'percentage' 
                        ? <Percent className="w-5 h-5 text-accent" />
                        : <IndianRupee className="w-5 h-5 text-accent" />
                      }
                      <span className="text-2xl font-bold text-white">
                        {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                      </span>
                      <span className="text-sm text-white/40">off</span>
                    </div>
                    {isExpiring && (
                      <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 text-[10px] font-bold">Expiring Soon</span>
                    )}
                  </div>

                  {coupon.description && <p className="text-sm text-white/50 mb-3">{coupon.description}</p>}

                  <div className="flex flex-wrap gap-2 text-[10px] text-white/30 mb-4">
                    {coupon.minOrderValue && <span className="px-2 py-1 rounded-md bg-white/5">Min: ₹{coupon.minOrderValue}</span>}
                    {coupon.maxDiscount && <span className="px-2 py-1 rounded-md bg-white/5">Max: ₹{coupon.maxDiscount}</span>}
                    {coupon.endDate && (
                      <span className="px-2 py-1 rounded-md bg-white/5 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Until {new Date(coupon.endDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <button onClick={() => copyCode(coupon.code)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-accent/10 border border-accent/20 text-accent font-bold text-sm hover:bg-accent hover:text-white transition-all">
                    {copied === coupon.code ? <><CheckCircle2 className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> {coupon.code}</>}
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
