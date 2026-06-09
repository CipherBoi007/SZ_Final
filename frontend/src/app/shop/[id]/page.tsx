'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, Heart, ShoppingBag, Minus, Plus, 
  ChevronLeft, Truck, ShieldCheck, RefreshCcw, 
  Zap, ArrowRight, Check, Share2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { productAPI } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useAuthStore } from '@/store/authStore';
import { getDiscountedPrice } from '@/types';
import { formatDeliveryDate } from '@/lib/utils';
import WishlistButton from '@/components/WishlistButton';

/* ─── Shared Components ────────────────────────────────── */

const StarRating = ({ rating, count }: { rating: number, count?: number }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="w-4 h-4 fill-accent text-accent" />
        ))}
        {hasHalfStar && (
          <div className="relative w-4 h-4 overflow-hidden">
            <Star className="absolute top-0 left-0 w-4 h-4 text-white/10" />
            <div className="absolute top-0 left-0 w-1/2 h-full overflow-hidden">
              <Star className="w-4 h-4 fill-accent text-accent" />
            </div>
          </div>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="w-4 h-4 text-white/10" />
        ))}
      </div>
      {count !== undefined && (
        <span className="ml-2 text-xs font-black text-white/30 tracking-widest">{rating.toFixed(1)} ({count})</span>
      )}
    </div>
  );
};

const MiniProductCard = ({ product }: { product: any }) => {
  const img = product.images?.find((im: any) => im.isPrimary) || product.images?.[0];
  const imgSrc = img?.url || img?.imageUrl || '/images/hero2.jpg';
  const discount = product.discount || 0;
  const price = product.variants?.[0]?.price || 0;
  const discounted = getDiscountedPrice(price, discount);

  return (
    <div className="group min-w-[200px] sm:min-w-[240px] flex flex-col bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden hover:bg-white/[0.04] transition-all duration-500">
      <Link href={`/shop/${product.id}`} className="relative aspect-[3/4] block overflow-hidden">
        <Image src={imgSrc} alt={product.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute top-3 right-3"><WishlistButton productId={product.id} /></div>
      </Link>
      <div className="p-4 flex flex-col gap-1">
        <h4 className="text-[11px] font-medium text-white/90 line-clamp-1 uppercase tracking-wide">{product.name}</h4>
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm font-semibold text-accent tracking-tighter">₹{discounted.toLocaleString()}</span>
          <StarRating rating={product.rating || 4.0} />
        </div>
      </div>
    </div>
  );
};

/* ─── Main Page ─────────────────────────────────────────── */

export default function ProductDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  
  const { addItem, openCart, fetchCart } = useCartStore();
  const { token } = useAuthStore();

  const fetchProductData = async () => {
    try {
      const { data } = await productAPI.getById(id as string);
      const p = data.data;
      setProduct(p);

      if (p.categoryId) {
        const simRes = await productAPI.getAll({ categoryId: p.categoryId, limit: 10 });
        setSimilarProducts((simRes.data?.data?.products || []).filter((item: any) => item.id !== p.id));
      }

      const variants = p.variants || [];
      if (variants.length > 0) {
        const uniqueSizes = [...new Set(variants.map((v: any) => v.size))] as string[];
        const firstSize = uniqueSizes[0] || '';
        setSelectedSize(firstSize);
        const colorsForSize = [...new Set(variants.filter((v: any) => v.size === firstSize).map((v: any) => v.color))] as string[];
        setSelectedColor(colorsForSize[0] || '');
      }
    } catch {
      toast.error('Product not found');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (id) fetchProductData();
  }, [id]);

  const variants = product?.variants || [];
  const uniqueSizes = [...new Set(variants.map((v: any) => v.size))] as string[];
  const colorsForSelectedSize = [...new Set(variants.filter((v: any) => v.size === selectedSize).map((v: any) => v.color))] as string[];

  const handleSizeChange = (size: string) => {
    setSelectedSize(size);
    const colorsForSize = [...new Set(variants.filter((v: any) => v.size === size).map((v: any) => v.color))] as string[];
    if (!colorsForSize.includes(selectedColor)) {
      setSelectedColor(colorsForSize[0] || '');
    }
  };

  const activeVariant = variants.find((v: any) => v.size === selectedSize && v.color === selectedColor);
  const variantPrice = activeVariant ? Number(activeVariant.price) : 0;
  const discountPercent = product?.discount || 0;
  const finalPrice = getDiscountedPrice(variantPrice, discountPercent);
  const variantStock = activeVariant?.stock || 0;
  const deliveryDate = product?.estimatedDelivery ? formatDeliveryDate(product.estimatedDelivery) : '';

  const handleAddToCart = async () => {
    if (!token) { toast.error('Please login first'); router.push('/auth/login'); return; }
    if (!selectedSize) { toast.error('Please select a size'); return; }
    if (!activeVariant) { toast.error('Selected combination is not available'); return; }
    setIsAdding(true);
    try {
      await addItem({ variantId: activeVariant.id, quantity });
      toast.success('Added to cart!');
      openCart();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add');
    } finally { setIsAdding(false); }
  };

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) { toast.error('Please login first'); return; }
    try {
      await productAPI.addReview(id as string, { rating: reviewRating, comment: reviewText });
      toast.success('Review submitted!');
      setReviewText('');
      fetchProductData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    }
  };

  const handleBuyNow = async () => {
    if (!token) { toast.error('Please login first'); router.push('/auth/login'); return; }
    if (!selectedSize) { toast.error('Please select a size'); return; }
    if (!activeVariant) { toast.error('Selected combination is not available'); return; }
    
    setIsAdding(true);
    try {
      const queryParams = new URLSearchParams({
        buy: 'now',
        variantId: activeVariant.id,
        quantity: quantity.toString(),
      }).toString();
      router.push(`/checkout?${queryParams}`);
    } catch (err: any) {
      toast.error('Failed to process checkout');
    } finally { setIsAdding(false); }
  };

  if (loading) return <div className="min-h-screen flex flex-col items-center justify-center gap-6"><div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin" /><p className="text-[10px] text-white/20 uppercase tracking-[0.6em]">Assembling Details</p></div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center text-white/50">Product not found</div>;

  const images = product.images?.map((img: any) => img.url || img.imageUrl) || ['/images/hero2.jpg'];
  const reviews = product.reviews || [];

  return (
    <div className="min-h-screen pt-20 lg:pt-24 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.4em] text-white/20 mb-8">
          <Link href="/shop" className="hover:text-accent transition-colors">Showroom</Link>
          <span className="text-white/5">/</span>
          <span className="text-white/40">{product.name}</span>
        </motion.div>

        {/* 60:40 Grid Ratio (lg:col-span-7 and lg:col-span-5) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          {/* Left: Gallery (60% equivalent) */}
          <div className="lg:col-span-7">
            <div className="flex flex-col-reverse lg:flex-row gap-6">
              <div className="flex lg:flex-col gap-4 overflow-x-auto lg:overflow-y-auto no-scrollbar max-h-[500px]">
                {images.map((img: string, i: number) => (
                  <button key={i} onClick={() => setSelectedImage(i)} className={`relative min-w-[80px] w-20 lg:w-24 aspect-[4/5] rounded-xl overflow-hidden transition-all border ${selectedImage === i ? 'border-accent shadow-[0_0_20px_rgba(220,20,60,0.3)]' : 'border-white/5 opacity-40 hover:opacity-100'}`}>
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
              <div className="flex-1">
                <motion.div key={selectedImage} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="relative aspect-[4/5] rounded-3xl overflow-hidden border border-white/5 bg-white/[0.02] shadow-2xl">
                  <Image src={images[selectedImage]} alt={product.name} fill className="object-cover" priority />
                  <div className="absolute top-6 right-6 z-10"><WishlistButton productId={product.id} /></div>
                  {product.discount > 0 && (
                    <div className="absolute top-6 left-6 px-4 py-2 rounded-full bg-accent text-white text-[11px] font-black uppercase tracking-widest glow-red">{product.discount}% OFF</div>
                  )}
                </motion.div>
              </div>
            </div>
            
            {/* COMPACT PERKS */}
            <div className="mt-6 grid grid-cols-3 gap-4 w-full lg:max-w-[calc(100%-120px)] lg:ml-auto">
              {[ { icon: Truck, label: 'Free Express' }, { icon: ShieldCheck, label: 'Secured' }, { icon: RefreshCcw, label: '14D Return' } ].map((perk, i) => (
                <div key={i} className="flex items-center justify-center gap-4 py-4 px-3 rounded-2xl bg-white/[0.02] border border-white/5 group hover:bg-white/[0.04] transition-all">
                  <perk.icon className="w-4 h-4 text-accent/50 group-hover:text-accent transition-colors" />
                  <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">{perk.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Info (40% equivalent) - ENLARGED TYPOGRAPHY */}
          <div className="lg:col-span-5 flex flex-col pt-4 lg:pt-0">
            <div className="flex items-center gap-4 mb-4">
              <span className="px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-black uppercase tracking-widest">{product.Category?.name}</span>
              <span className="text-white/20 text-[10px] font-black uppercase tracking-widest">In Stock: {variantStock}</span>
            </div>
            
            {/* Larger Title */}
            <h1 className="text-4xl lg:text-5xl font-serif font-black text-white tracking-tight uppercase leading-[0.95] mb-4">{product.name}</h1>
            
            <div className="flex items-center gap-8 mb-8">
              <Link href={`/shop/${product.id}/reviews`} className="group/rating flex items-center gap-6 hover:opacity-80 transition-all">
                <StarRating rating={product.rating || 4.2} count={product.numReviews} />
              </Link>
              <button className="text-[11px] font-black text-white/30 hover:text-white uppercase tracking-[0.4em] transition-all">Share Piece</button>
            </div>

            {/* Larger Price */}
            <div className="flex items-baseline gap-5 mb-8">
              <span className="text-4xl lg:text-5xl font-black text-accent tracking-tighter">₹{finalPrice.toLocaleString()}</span>
              {discountPercent > 0 && (
                <span className="text-2xl text-white/20 line-through font-medium tracking-tighter">₹{variantPrice.toLocaleString()}</span>
              )}
            </div>

            {/* Larger Description */}
            <p className="text-[16px] text-white/40 leading-relaxed font-medium mb-8 pb-8 border-b border-white/5 italic">"{product.description}"</p>

            {/* Selection - Larger labels */}
            <div className="space-y-8 mb-10">
              <div>
                <h3 className="text-[11px] font-black text-white/20 uppercase tracking-[0.5em] mb-4">Select Size</h3>
                <div className="flex flex-wrap gap-3">
                  {uniqueSizes.map((size: string) => (
                    <button key={size} onClick={() => handleSizeChange(size)} className={`w-14 h-14 rounded-2xl flex items-center justify-center text-[12px] font-black transition-all border ${selectedSize === size ? 'bg-accent border-accent text-white glow-red' : 'bg-white/5 border-white/5 text-white/40 hover:border-white/15'}`}>{size}</button>
                  ))}
                </div>
              </div>

              {colorsForSelectedSize.length > 0 && (
                <div>
                  <h3 className="text-[11px] font-black text-white/20 uppercase tracking-[0.5em] mb-4">Select Hue</h3>
                  <div className="flex gap-4">
                    {colorsForSelectedSize.map((color: string) => (
                      <button key={color} onClick={() => setSelectedColor(color)} className={`w-10 h-10 rounded-full transition-all border-2 ${selectedColor === color ? 'border-accent p-1' : 'border-white/5 hover:border-white/20'}`}>
                        <div className="w-full h-full rounded-full shadow-inner" style={{ backgroundColor: color.toLowerCase() }} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl p-1 shrink-0">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-4 text-white/20 hover:text-white transition-all"><Minus className="w-4 h-4" /></button>
                  <span className="w-10 text-center text-sm font-black text-white">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(variantStock, quantity + 1))} className="p-4 text-white/20 hover:text-white transition-all"><Plus className="w-4 h-4" /></button>
                </div>
                <button onClick={handleAddToCart} disabled={isAdding || variantStock === 0} className="flex-1 bg-white text-black text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-accent hover:text-white transition-all shadow-2xl flex items-center justify-center gap-3">
                  <ShoppingBag className="w-4 h-4" /> {isAdding ? 'Syncing...' : 'Add to Bag'}
                </button>
              </div>
              <button onClick={handleBuyNow} disabled={isAdding || variantStock === 0} className="w-full py-5 rounded-2xl bg-accent text-white text-[11px] font-black uppercase tracking-[0.4em] glow-red transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3">
                <Zap className="w-4 h-4 fill-white" /> Rapid Checkout
              </button>
            </div>
            
            {deliveryDate && (
              <p className="mt-6 text-center text-[10px] font-black text-white/10 uppercase tracking-[0.6em]">Est. Delivery: {deliveryDate}</p>
            )}
          </div>
        </div>

        {/* TIGHTENED REVIEWS PREVIEW - Only show if social proof exists */}
        {reviews.length > 0 && (
          <div className="mt-24 pt-16 border-t border-white/5">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl font-serif font-black text-white uppercase tracking-tight mb-2">Social Proof</h2>
                <StarRating rating={product.rating || 4.2} count={reviews.length} />
              </div>
              {reviews.length > 2 && (
                <Link href={`/shop/${product.id}/reviews`} className="px-8 py-3.5 rounded-full border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all flex items-center gap-3">
                  See All {reviews.length} Reviews <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.slice(0, 2).map((review: any) => (
                <div key={review.id} className="p-8 rounded-3xl bg-white/[0.01] border border-white/5 hover:border-white/10 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{review.User?.name || 'Guest'}</span>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => <Star key={i} className={`w-2.5 h-2.5 ${i < review.rating ? 'fill-accent text-accent' : 'text-white/5'}`} />)}
                    </div>
                  </div>
                  <p className="text-sm text-white/50 leading-relaxed italic line-clamp-3">"{review.comment}"</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {similarProducts.length > 0 && (
          <section className="mt-32 pt-20 border-t border-white/5">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-4xl font-serif font-black text-white uppercase tracking-tight">People Also Like</h2>
              <Link href="/shop" className="text-[11px] font-black text-white/20 hover:text-accent uppercase tracking-[0.4em] transition-all flex items-center gap-3">Showroom <ArrowRight className="w-4 h-4" /></Link>
            </div>
            <div className="flex gap-6 overflow-x-auto no-scrollbar pb-10 -mx-4 px-4 sm:mx-0 sm:px-0">
              {similarProducts.map((p) => (
                <div key={p.id} className="min-w-[200px] sm:min-w-[260px]">
                  <MiniProductCard product={p} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Mobile Sticky Action Hub */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 p-4 pb-8 glass-strong border-t border-white/10">
        <div className="max-w-md mx-auto flex gap-3">
          <button 
            onClick={handleAddToCart}
            disabled={isAdding || variantStock === 0}
            className="flex-1 py-4 rounded-xl bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-3.5 h-3.5" /> Bag
          </button>
          <button 
            onClick={handleBuyNow}
            disabled={isAdding || variantStock === 0}
            className="flex-[2] py-4 rounded-xl bg-accent text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 glow-red shadow-2xl"
          >
            <Zap className="w-3.5 h-3.5 fill-white" /> Rapid Checkout
          </button>
        </div>
      </div>
    </div>
  );
}