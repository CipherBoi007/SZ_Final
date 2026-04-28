'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Minus, Plus, X, ArrowRight, ArrowLeft, Tag, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { couponAPI } from '@/lib/api';

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function CartPage() {
  const router = useRouter();
  const { items, total, fetchCart, updateQuantity, removeItem } = useCartStore();
  const { token } = useAuthStore();
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState('');
  const [buyingNow, setBuyingNow] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      fetchCart();
    }
  }, [token, fetchCart]);

  const handleApplyCoupon = async () => {
    if (!coupon.trim()) return;
    try {
      const { data } = await couponAPI.validate(coupon, total);
      const coup = data.data;
      const discountAmt = coup.discountType === 'percentage'
        ? Math.min(total * coup.discountValue / 100, coup.maxDiscount || Infinity)
        : coup.discountValue;
      setDiscount(discountAmt);
      setCouponApplied(coupon);
      toast.success(`Coupon applied! ₹${discountAmt.toLocaleString()} off`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid coupon');
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await removeItem(id);
      toast.success('Item removed');
    } catch { 
      toast.error('Failed to remove'); 
    }
  };

  const handleUpdateQty = async (id: string, qty: number) => {
    if (qty < 1) return;
    try {
      await updateQuantity(id, qty);
    } catch { 
      toast.error('Failed to update'); 
    }
  };

  const handleBuyNow = async (item: any) => {
    if (!token) {
      toast.error('Please login first');
      router.push('/auth/login');
      return;
    }
    setBuyingNow(item.id);
    try {
      const queryParams = new URLSearchParams({
        buy: 'now',
        variantId: item.variantId,
        quantity: item.quantity.toString(),
      }).toString();
      router.push(`/checkout?${queryParams}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to process');
    } finally {
      setBuyingNow(null);
    }
  };

  const shipping = total > 999 ? 0 : 99;
  const grandTotal = Math.max(0, total - discount + shipping);

  return (
    <div className="min-h-screen pt-24 lg:pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link href="/shop" className="inline-flex items-center gap-2 text-xs text-white/30 hover:text-white transition-colors mb-6 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Shop
          </Link>
          <h1 className="text-3xl font-bold gradient-text mb-8">
            Shopping Cart <span className="text-lg text-white/30 font-normal">({items.length} items)</span>
          </h1>
        </motion.div>
        
        {items.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <p className="text-white/30 text-lg mb-4">Your cart is empty</p>
            <Link href="/shop" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent-hover transition-all">
              Continue Shopping <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item: any, i: number) => {
                const variant = item.variant || {};
                const product = variant.Product || {};
                const img = product.images?.find((im: any) => im.isPrimary) || product.images?.[0];
                const imgSrc = img?.url || img?.imageUrl || '/images/hero2.jpg';
                const price = Number(variant.price) || 0;
                
                return (
                  <motion.div 
                    key={item.id} 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: i * 0.1 }} 
                    className="flex gap-4 p-4 rounded-2xl glass"
                  >
                    <div className="relative w-24 h-32 sm:w-28 sm:h-36 rounded-xl overflow-hidden shrink-0">
                      <Image src={imgSrc} alt={product.name || 'Product'} fill className="object-cover" />
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <Link href={`/shop/${variant.productId || product.id}`} className="text-sm font-medium text-white hover:text-accent transition-colors line-clamp-2">
                            {product.name}
                          </Link>
                          <button onClick={() => handleRemove(item.id)} className="p-1 text-white/20 hover:text-white/60 transition-colors shrink-0">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="mt-1 text-xs text-white/30">{variant.size} / {variant.color}</p>
                        {variant.sku && <p className="text-[10px] text-white/20">SKU: {variant.sku}</p>}
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-3">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center glass rounded-lg">
                            <button 
                              onClick={() => handleUpdateQty(item.id, Math.max(1, item.quantity - 1))} 
                              className="p-2 text-white/50 hover:text-white"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-8 text-center text-sm font-medium text-white">{item.quantity}</span>
                            <button 
                              onClick={() => handleUpdateQty(item.id, item.quantity + 1)} 
                              className="p-2 text-white/50 hover:text-white"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <span className="text-sm font-bold text-white">₹{(price * item.quantity).toLocaleString()}</span>
                        </div>
                        
                        {/* Buy Now Button for each item */}
                        <button
                          onClick={() => handleBuyNow(item)}
                          disabled={buyingNow === item.id}
                          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-accent/10 text-accent text-xs font-semibold hover:bg-accent hover:text-white transition-all disabled:opacity-50"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          {buyingNow === item.id ? '...' : 'Buy Now'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:sticky lg:top-28 h-fit">
              <div className="p-6 rounded-2xl glass-strong">
                <h2 className="text-lg font-bold text-white mb-6">Order Summary</h2>
                
                <div className="flex gap-2 mb-6">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input 
                      value={coupon} 
                      onChange={(e) => setCoupon(e.target.value)} 
                      placeholder="Coupon code"
                      className="w-full py-2.5 pl-9 pr-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 outline-none focus:border-accent/50" 
                    />
                  </div>
                  <button 
                    onClick={handleApplyCoupon} 
                    className="px-4 rounded-lg bg-white/5 border border-white/10 text-sm text-white/60 hover:text-white hover:border-white/20 transition-colors"
                  >
                    Apply
                  </button>
                </div>
                
                {couponApplied && (
                  <p className="text-xs text-emerald-400 mb-4">Coupon applied: {couponApplied} ✓</p>
                )}
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-white/50">
                    <span>Subtotal</span>
                    <span>₹{total.toLocaleString()}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Discount</span>
                      <span>-₹{discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-white/50">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? <span className="text-emerald-400">Free</span> : `₹${shipping}`}</span>
                  </div>
                  <div className="pt-3 border-t border-white/5 flex justify-between text-white font-bold text-base">
                    <span>Total</span>
                    <span>₹{grandTotal.toLocaleString()}</span>
                  </div>
                </div>
                
                <Link 
                  href="/checkout" 
                  className="mt-6 w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-accent hover:bg-accent-hover text-white font-semibold transition-all glow-red-hover"
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}