'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, CreditCard, Truck, ShieldCheck, ChevronLeft, Plus, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { addressAPI, orderAPI, productAPI, paymentAPI, couponAPI } from '@/lib/api';

declare global {
  interface Window {
    Razorpay: any;
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDirectBuyQuery = searchParams.get('buy') === 'now';
  const { fetchCart, clearCart } = useCartStore();
  const { token } = useAuthStore();
  
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'razorpay'>('razorpay');
  const [placing, setPlacing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  
  const [isDirectBuy, setIsDirectBuy] = useState(false);
  const [buyNowItem, setBuyNowItem] = useState<any | null>(null);
  const [cartItems, setCartItems] = useState<any[]>([]);

  const activeItems = buyNowItem ? [buyNowItem] : cartItems;
  const subtotal = activeItems.reduce((sum, item) => {
    const price = Number(item.variant?.price) || 0;
    return sum + price * item.quantity;
  }, 0);

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discountType === 'percentage') {
      const discount = (subtotal * appliedCoupon.discountValue) / 100;
      return appliedCoupon.maxDiscount ? Math.min(discount, appliedCoupon.maxDiscount) : discount;
    }
    return appliedCoupon.discountValue;
  };

  const discountAmount = calculateDiscount();
  const shipping = subtotal > 999 ? 0 : 99;
  const grandTotal = subtotal + shipping - discountAmount;

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setValidatingCoupon(true);
    try {
      const { data } = await couponAPI.validate(couponCode, subtotal);
      setAppliedCoupon(data.data.coupon);
      toast.success('Coupon applied successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid coupon');
      setAppliedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  useEffect(() => {
    if (!token) {
      router.push('/auth/login');
      return;
    }

    let active = true;

    async function load() {
      setLoading(true);
      try {
        if (isDirectBuyQuery) {
          const directVariantId = searchParams.get('variantId');
          const directQuantity = Number(searchParams.get('quantity') || '1');

          if (directVariantId) {
            setIsDirectBuy(true);
            setBuyNowItem({
              id: 'direct',
              variantId: directVariantId,
              quantity: directQuantity,
              variant: {
                id: directVariantId,
                price: 0, 
                size: '',
                color: '',
                Product: { name: 'Loading...', images: [] },
              },
            });
            setCartItems([]);

            try {
              const { data: productsData } = await productAPI.getAll({ limit: 100 });
              const products = productsData.data?.products || [];
              for (const product of products) {
                const variant = product.variants?.find((v: any) => v.id === directVariantId);
                if (variant) {
                  setBuyNowItem({
                    id: 'direct',
                    variantId: directVariantId,
                    quantity: directQuantity,
                    variant: {
                      ...variant,
                      Product: {
                        id: product.id,
                        name: product.name,
                        brand: product.brand,
                        images: product.images,
                      },
                    },
                  });
                  break;
                }
              }
            } catch {
            }
          }
        } else {
          setIsDirectBuy(false);
          setBuyNowItem(null);
          await fetchCart();
          const { items: cartItemsState } = useCartStore.getState();
          setCartItems(cartItemsState || []);
        }

        const { data } = await addressAPI.getAll();
        const addrs = data.data || [];
        if (!active) return;
        setAddresses(addrs);

        setSelectedAddress((currentSelected) => {
          if (currentSelected && addrs.some((addr: any) => addr.id.toString() === currentSelected)) {
            return currentSelected;
          }
          const def = addrs.find((a: any) => a.isDefault) || addrs[0];
          return def?.id.toString() || '';
        });
      } catch (error) {
        console.error('Checkout load error:', error);
        if (!isDirectBuyQuery) {
          setBuyNowItem(null);
          setCartItems([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => { active = false; };
  }, [token, router, fetchCart, isDirectBuyQuery, searchParams]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please select a delivery address');
      return;
    }

    if (activeItems.length === 0) {
      toast.error('No items available for checkout');
      return;
    }

    setPlacing(true);
    try {
      const orderData: any = {
        shippingAddressId: selectedAddress,
        paymentMethod,
        couponCode: appliedCoupon?.code,
      };

      if (isDirectBuy && buyNowItem) {
        orderData.directBuy = true;
        orderData.items = [{
          variantId: buyNowItem.variantId,
          quantity: buyNowItem.quantity,
        }];
      }

      if (paymentMethod === 'razorpay') {
        const res = await loadRazorpayScript();
        if (!res) {
          toast.error('Razorpay SDK failed to load. Are you online?');
          setPlacing(false);
          return;
        }

        // 1. Create Razorpay Order
        const { data: rpOrderData } = await paymentAPI.createOrder({ 
          amount: grandTotal,
          receipt: `order_rcpt_${Date.now()}`
        });

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_ShPCY9vwVFgWgq',
          amount: rpOrderData.data.amount,
          currency: rpOrderData.data.currency,
          name: 'SouthZone',
          description: 'Payment for your order',
          image: '/images/southzone_logo_final.jpg',
          order_id: rpOrderData.data.orderId,
          handler: async function (response: any) {
            try {
              // 2. Verification and Order Creation
              const finalOrderData = {
                ...orderData,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              };

              const { data: dbOrder } = await orderAPI.create(finalOrderData);
              
              if (!isDirectBuy) await clearCart();
              
              toast.success('Payment successful and order placed!');
              router.push(`/checkout/success?order=${dbOrder.data?.id || ''}`);
            } catch (err: any) {
              console.error('Final order creation error:', err);
              toast.error('Payment verified but order creation failed. Please contact support.');
            }
          },
          prefill: {
            name: (addresses.find(a => a.id.toString() === selectedAddress))?.name || '',
            email: (useAuthStore.getState().user as any)?.email || '',
            contact: (addresses.find(a => a.id.toString() === selectedAddress))?.phone || '',
          },
          theme: {
            color: '#FF385C',
          },
        };

        const rzp1 = new window.Razorpay(options);
        rzp1.on('payment.failed', function (response: any) {
          toast.error(response.error.description || 'Payment failed');
          setPlacing(false);
        });
        rzp1.open();
      } else {
        // COD Flow
        const { data } = await orderAPI.create(orderData);
        if (!isDirectBuy) await clearCart();
        toast.success('Order placed successfully!');
        router.push(`/checkout/success?order=${data.data?.id || ''}`);
      }
    } catch (err: any) {
      console.error('Order error:', err.response?.data || err);
      toast.error(err.response?.data?.message || 'Failed to initiate order');
    } finally {
      if (paymentMethod !== 'razorpay') setPlacing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 lg:pt-28 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link href={isDirectBuy ? "/shop" : "/cart"} className="flex items-center gap-1 text-sm text-white/30 hover:text-white/60 transition-colors mb-8">
            <ChevronLeft className="w-4 h-4" /> Back
          </Link>
        </motion.div>
        
        <h1 className="text-3xl font-bold gradient-text mb-8">
          Checkout {isDirectBuy && <span className="text-lg text-white/30">(Direct Buy)</span>}
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-2xl glass-strong">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-accent" /> Delivery Address
                </h2>
                <Link href="/profile" className="text-xs text-accent hover:underline flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Add New
                </Link>
              </div>
              
              {addresses.length === 0 ? (
                <p className="text-sm text-white/30">No addresses saved. <Link href="/profile" className="text-accent hover:underline">Add one</Link></p>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr: any) => (
                    <label key={addr.id} className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all ${
                      selectedAddress === addr.id.toString() 
                        ? 'bg-accent/10 border border-accent/30' 
                        : 'bg-white/5 border border-white/5 hover:border-white/10'
                    }`}>
                      <input 
                        type="radio" 
                        name="address" 
                        value={addr.id} 
                        checked={selectedAddress === addr.id.toString()} 
                        onChange={() => setSelectedAddress(addr.id.toString())}
                        className="mt-1 w-4 h-4 text-accent focus:ring-accent/20 bg-white/5 border-white/20" 
                      />
                      <div>
                        <p className="text-sm font-medium text-white">
                          {addr.name} 
                          {addr.isDefault && <span className="text-[10px] text-accent ml-2">Default</span>}
                        </p>
                        <p className="text-xs text-white/50 mt-1">
                          {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}, {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                        <p className="text-xs text-white/30 mt-0.5">Phone: {addr.phone}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Payment Method */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-6 rounded-2xl glass-strong">
              <h2 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                <CreditCard className="w-4 h-4 text-accent" /> Payment Method
              </h2>
              <div className="space-y-3">
                {/* Cash on Delivery */}
                <label className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all ${
                  paymentMethod === 'cod' 
                    ? 'bg-accent/10 border border-accent/30' 
                    : 'bg-white/5 border border-white/5 hover:border-white/10'
                }`}>
                  <input 
                    type="radio" 
                    name="payment" 
                    value="cod" 
                    checked={paymentMethod === 'cod'} 
                    onChange={() => setPaymentMethod('cod')}
                    className="w-4 h-4 text-accent focus:ring-accent/20 bg-white/5 border-white/20"
                  />
                  <Wallet className="w-5 h-5 text-accent" />
                  <div>
                    <span className="text-sm font-medium text-white">Cash on Delivery</span>
                    <p className="text-xs text-white/30">Pay when you receive your order</p>
                  </div>
                </label>

                {/* Online Payment */}
                <label className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all ${
                  paymentMethod === 'razorpay' 
                    ? 'bg-accent/10 border border-accent/30' 
                    : 'bg-white/5 border border-white/5 hover:border-white/10'
                }`}>
                  <input 
                    type="radio" 
                    name="payment" 
                    value="razorpay" 
                    checked={paymentMethod === 'razorpay'} 
                    onChange={() => setPaymentMethod('razorpay')}
                    className="w-4 h-4 text-accent focus:ring-accent/20 bg-white/5 border-white/20"
                  />
                  <CreditCard className="w-5 h-5 text-accent" />
                  <div>
                    <span className="text-sm font-medium text-white">Online Payment</span>
                    <p className="text-xs text-white/30">UPI, Cards, Netbanking — Razorpay Secure</p>
                  </div>
                </label>
              </div>
            </motion.div>

            {/* Order Items */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-6 rounded-2xl glass-strong">
              <h2 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                <Truck className="w-4 h-4 text-accent" /> Order Items ({activeItems.length})
              </h2>
              <div className="space-y-3">
                {activeItems.map((item: any) => {
                  const variant = item.variant || {};
                  const product = variant.Product || {};
                  const img = product.images?.find((im: any) => im.isPrimary) || product.images?.[0];
                  const imgSrc = img?.url || '/images/hero2.jpg';
                  const price = Number(variant.price) || 0;
                  return (
                    <div key={item.id || 'direct'} className="flex gap-3 items-center">
                      <div className="w-14 h-14 rounded-lg overflow-hidden relative shrink-0">
                        <Image src={imgSrc} alt={product.name || ''} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white/80 truncate">{product.name}</p>
                        <p className="text-[10px] text-white/30">{variant.size} / {variant.color} × {item.quantity}</p>
                      </div>
                      <span className="text-sm font-semibold text-white shrink-0">
                        ₹{(price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Order Summary */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:sticky lg:top-28 h-fit">
            <div className="p-6 rounded-2xl glass-strong">
              <h2 className="text-lg font-bold text-white mb-6">Order Summary</h2>
              
              {/* Coupon Section */}
              <div className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Coupon Code"
                    disabled={appliedCoupon}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder:text-white/20 outline-none focus:border-accent/50 disabled:opacity-50"
                  />
                  {appliedCoupon ? (
                    <button
                      onClick={() => { setAppliedCoupon(null); setCouponCode(''); }}
                      className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-white/60 hover:text-white hover:bg-white/10 transition-all"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      onClick={handleApplyCoupon}
                      disabled={validatingCoupon || !couponCode}
                      className="px-6 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-bold transition-all disabled:opacity-50"
                    >
                      {validatingCoupon ? '...' : 'Apply'}
                    </button>
                  )}
                </div>
                {appliedCoupon && (
                  <p className="mt-2 text-[10px] text-emerald-400 font-medium">
                    ✓ Coupon "{appliedCoupon.code}" applied!
                  </p>
                )}
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-white/50">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount</span>
                    <span>-₹{discountAmount.toLocaleString()}</span>
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
              
              <button 
                onClick={handlePlaceOrder} 
                disabled={placing}
                className="mt-6 w-full py-4 rounded-xl bg-accent hover:bg-accent-hover text-white font-semibold transition-all glow-red-hover disabled:opacity-50"
              >
                {placing ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : `Place Order (${paymentMethod === 'cod' ? 'COD' : 'Pay Online'})`}
              </button>
              
              <div className="mt-4 flex items-center justify-center gap-1 text-[10px] text-white/20">
                <ShieldCheck className="w-3 h-3" /> Secure checkout
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>}>
      <CheckoutContent />
    </Suspense>
  );
}