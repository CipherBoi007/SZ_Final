'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, Heart, ShoppingBag, Minus, Plus, ChevronLeft, Truck, ShieldCheck, RefreshCcw, Zap, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { productAPI } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useAuthStore } from '@/store/authStore';
import { getDiscountedPrice } from '@/types';

/* eslint-disable @typescript-eslint/no-explicit-any */

import { formatDeliveryDate } from '@/lib/utils';

export default function ProductDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const { addItem, openCart, fetchCart } = useCartStore();
  const { addItem: addWishlist, removeItem: removeWishlist, isInWishlist, getWishlistItemId, fetchWishlist } = useWishlistStore();
  const { token } = useAuthStore();

  useEffect(() => {
    async function fetchProduct() {
      try {
        const { data } = await productAPI.getById(id as string);
        const p = data.data;
        setProduct(p);
        // Set defaults from variants
        const variants = p.variants || [];
        if (variants.length > 0) {
          const uniqueSizes = [...new Set(variants.map((v: any) => v.size))] as string[];
          const firstSize = uniqueSizes[0] || '';
          setSelectedSize(firstSize);
          // Get colors available for that size
          const colorsForSize = [...new Set(variants.filter((v: any) => v.size === firstSize).map((v: any) => v.color))] as string[];
          setSelectedColor(colorsForSize[0] || '');
        }
      } catch {
        toast.error('Product not found');
      }
      setLoading(false);
    }
    if (id) fetchProduct();
    if (token) {
      fetchCart();
      fetchWishlist();
    }
  }, [id, token, fetchCart, fetchWishlist]);

  // Get available sizes and colors from variants
  const variants = product?.variants || [];
  const uniqueSizes = [...new Set(variants.map((v: any) => v.size))] as string[];
  const colorsForSelectedSize = [...new Set(
    variants.filter((v: any) => v.size === selectedSize).map((v: any) => v.color)
  )] as string[];

  // When size changes, reset color to first available
  const handleSizeChange = (size: string) => {
    setSelectedSize(size);
    const colorsForSize = [...new Set(
      variants.filter((v: any) => v.size === size).map((v: any) => v.color)
    )] as string[];
    if (!colorsForSize.includes(selectedColor)) {
      setSelectedColor(colorsForSize[0] || '');
    }
  };

  // Find the active variant
  const activeVariant = variants.find(
    (v: any) => v.size === selectedSize && v.color === selectedColor
  );

  const variantPrice = activeVariant ? Number(activeVariant.price) : 0;
  const discountPercent = product?.discount || 0;
  const finalPrice = getDiscountedPrice(variantPrice, discountPercent);
  const variantStock = activeVariant?.stock || 0;

  const deliveryDate = product?.estimatedDelivery 
    ? formatDeliveryDate(product.estimatedDelivery) 
    : '';

  const handleAddToCart = async () => {
    if (!token) { toast.error('Please login first'); router.push('/auth/login'); return; }
    if (!selectedSize) { toast.error('Please select a size'); return; }
    if (!activeVariant) { toast.error('Selected combination is not available'); return; }
    setIsAdding(true);
    try {
      await addItem({ 
        variantId: activeVariant.id,
        quantity,
      });
      toast.success('Added to cart!');
      openCart();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!token) { 
      toast.error('Please login first'); 
      router.push('/auth/login'); 
      return; 
    }
    if (!selectedSize) { 
      toast.error('Please select a size'); 
      return; 
    }
    if (!activeVariant) {
      toast.error('Selected combination is not available');
      return;
    }
    
    setIsAdding(true);
    try {
      const queryParams = new URLSearchParams({
        buy: 'now',
        variantId: activeVariant.id,
        quantity: quantity.toString(),
      }).toString();

      router.push(`/checkout?${queryParams}`);
      
    } catch (err: any) {
      console.error('Buy Now error:', err);
      toast.error(err.response?.data?.message || 'Failed to process');
    } finally {
      setIsAdding(false);
    }
  };
  
  const toggleWishlist = async () => {
    if (!token) { toast.error('Please login first'); router.push('/auth/login'); return; }
    try {
      if (inWishlist) {
        const wishlistItemId = getWishlistItemId(product.id?.toString());
        if (wishlistItemId) {
          await removeWishlist(wishlistItemId);
          toast.success('Removed from wishlist');
        }
      } else {
        await addWishlist(product.id.toString());
        toast.success('Added to wishlist');
      }
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) { toast.error('Please login first'); return; }
    try {
      await productAPI.addReview(id as string, { rating: reviewRating, comment: reviewText });
      toast.success('Review submitted!');
      setReviewText('');
      const { data } = await productAPI.getById(id as string);
      setProduct(data.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center text-white/50">Product not found</div>;

  const images = product.images?.map((img: any) => img.url || img.imageUrl) || ['/images/hero2.jpg'];
  const reviews = product.reviews || [];
  const inWishlist = isInWishlist(product.id?.toString());

  // Color map for common colors
  const colorHex: Record<string, string> = {
    black: '#000', white: '#fff', red: '#ef4444', blue: '#3b82f6', green: '#22c55e',
    yellow: '#eab308', orange: '#f97316', purple: '#a855f7', pink: '#ec4899',
    brown: '#92400e', grey: '#6b7280', gray: '#6b7280', navy: '#1e3a5f',
    maroon: '#800000', beige: '#f5f5dc', cream: '#fffdd0', teal: '#0d9488',
  };

  return (
    <div className="min-h-screen pt-24 lg:pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-sm text-white/30 mb-8">
          <Link href="/shop" className="flex items-center gap-1 hover:text-white/60 transition-colors"><ChevronLeft className="w-4 h-4" /> Shop</Link>
          <span>/</span><span className="text-white/50">{product.name}</span>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Left Column - Images */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="flex justify-center lg:justify-end lg:pr-8">
            <div className="w-full max-w-md">
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden glass mb-4 shadow-2xl border border-white/5">
                <Image src={images[selectedImage]} alt={product.name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" priority />
              </div>
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {images.map((img: string, i: number) => (
                    <button key={i} onClick={() => setSelectedImage(i)}
                      className={`relative aspect-square rounded-xl overflow-hidden transition-all ${selectedImage === i ? 'ring-2 ring-accent glow-red' : 'opacity-50 hover:opacity-100 hover:ring-1 hover:ring-white/30'}`}>
                      <Image src={img} alt="" fill sizes="100px" className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Right Column - Details */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <div className="flex items-center gap-2">
              <span className="text-accent text-xs font-semibold tracking-[0.2em] uppercase">{product.Category?.name}</span>
              {product.brand && <span className="text-white/30 text-xs">•</span>}
              {product.brand && <span className="text-white/40 text-xs">{product.brand}</span>}
            </div>
            <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-white">{product.name}</h1>
            
            <div className="mt-3 flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating || 0) ? 'fill-accent text-accent' : 'text-white/10'}`} />)}
              </div>
              <span className="text-sm text-white/40">{product.rating || 0} ({product.numReviews || reviews.length} reviews)</span>
            </div>
            
            <div className="mt-6 flex items-baseline gap-3">
              <span className="text-3xl font-bold text-white">₹{finalPrice.toLocaleString()}</span>
              {discountPercent > 0 && (
                <>
                  <span className="text-lg text-white/30 line-through">₹{variantPrice.toLocaleString()}</span>
                  <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-bold">{discountPercent}% OFF</span>
                </>
              )}
            </div>

            {/* SKU */}
            {activeVariant?.sku && (
              <p className="mt-2 text-xs text-white/20">SKU: {activeVariant.sku}</p>
            )}
            
            {/* Delivery Date */}
            {deliveryDate && (
              <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-accent/5 border border-accent/15">
                <Truck className="w-4 h-4 text-accent" />
                <div>
                  <p className="text-[10px] text-white/40 uppercase tracking-wider">Estimated Delivery</p>
                  <p className="text-sm font-semibold text-white">{deliveryDate}</p>
                </div>
              </div>
            )}
            
            <p className="mt-6 text-sm text-white/50 leading-relaxed">{product.description}</p>
            {product.material && (
              <p className="mt-2 text-xs text-white/30">Material: {product.material}</p>
            )}

            {/* Size selector (Matrix Step 1) */}
            <div className="mt-8">
              <span className="text-sm font-medium text-white/70">Size</span>
              <div className="mt-3 flex flex-wrap gap-2">
                {uniqueSizes.map((size: string) => (
                  <button key={size} onClick={() => handleSizeChange(size)}
                    className={`w-12 h-12 rounded-xl text-sm font-medium transition-all ${selectedSize === size ? 'bg-accent text-white glow-red' : 'glass text-white/60 hover:text-white hover:bg-white/5'}`}>{size}</button>
                ))}
              </div>
            </div>

            {/* Color selector (Matrix Step 2 — filtered by selected size) */}
            {colorsForSelectedSize.length > 0 && (
              <div className="mt-6">
                <span className="text-sm font-medium text-white/70">Color: <span className="text-white">{selectedColor}</span></span>
                <div className="mt-3 flex gap-3 flex-wrap">
                  {colorsForSelectedSize.map((color: string) => {
                    const bgColor = colorHex[color.toLowerCase()] || '#888';
                    return (
                      <button key={color} onClick={() => setSelectedColor(color)}
                        className={`w-9 h-9 rounded-full transition-all border-2 ${selectedColor === color ? 'ring-2 ring-offset-2 ring-offset-background ring-accent scale-110 border-accent' : 'border-white/10 hover:scale-110 hover:border-white/30'}`}
                        style={{ backgroundColor: bgColor }} title={color} />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Variant availability indicator */}
            {selectedSize && selectedColor && !activeVariant && (
              <p className="mt-4 text-sm text-red-400">This size/color combination is not available.</p>
            )}

            {/* Quantity */}
            <div className="mt-8 flex items-center gap-4">
              <span className="text-sm font-medium text-white/70">Qty</span>
              <div className="flex items-center glass rounded-xl">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 text-white/50 hover:text-white transition-colors"><Minus className="w-4 h-4" /></button>
                <span className="w-12 text-center text-sm font-medium text-white">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(variantStock || 99, quantity + 1))} className="p-3 text-white/50 hover:text-white transition-colors"><Plus className="w-4 h-4" /></button>
              </div>
              <span className="text-xs text-white/30">{variantStock} in stock</span>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex gap-3">
              <button onClick={handleAddToCart} disabled={isAdding || variantStock === 0 || !activeVariant}
                className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-white/20 text-white font-semibold hover:bg-white/5 transition-all disabled:opacity-50">
                <ShoppingBag className="w-5 h-5" /> {isAdding ? 'Adding...' : 'Add to Cart'}
              </button>
              <button onClick={handleBuyNow} disabled={isAdding || variantStock === 0 || !activeVariant}
                className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl bg-accent hover:bg-accent-hover text-white font-semibold transition-all glow-red-hover disabled:opacity-50">
                <Zap className="w-5 h-5" /> Buy Now
              </button>
              <button onClick={toggleWishlist} className={`p-4 rounded-xl glass glass-hover transition-colors ${inWishlist ? 'text-accent' : 'text-white/50 hover:text-accent'}`}>
                <Heart className={`w-5 h-5 ${inWishlist ? 'fill-accent' : ''}`} />
              </button>
            </div>

            {/* Perks */}
            <div className="mt-8 grid grid-cols-3 gap-3">
              <div className="text-center py-3 rounded-xl glass"><Truck className="w-4 h-4 mx-auto text-accent mb-1" /><span className="text-[10px] text-white/40">Free Delivery</span></div>
              <div className="text-center py-3 rounded-xl glass"><ShieldCheck className="w-4 h-4 mx-auto text-accent mb-1" /><span className="text-[10px] text-white/40">Genuine Product</span></div>
              <div className="text-center py-3 rounded-xl glass"><RefreshCcw className="w-4 h-4 mx-auto text-accent mb-1" /><span className="text-[10px] text-white/40">Easy Returns</span></div>
            </div>
          </motion.div>
        </div>

        {/* Reviews Section */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-24">
          <h2 className="text-2xl font-bold gradient-text mb-8">Reviews</h2>
          {token ? (
            <form onSubmit={handleReview} className="mb-8 p-6 rounded-2xl glass-strong">
              <h3 className="text-sm font-semibold text-white mb-4">Write a review</h3>
              <div className="flex items-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((r) => (
                  <button key={r} type="button" onClick={() => setReviewRating(r)}>
                    <Star className={`w-5 h-5 ${r <= reviewRating ? 'fill-accent text-accent' : 'text-white/10'}`} />
                  </button>
                ))}
              </div>
              <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} required placeholder="Share your experience..." rows={3}
                className="w-full rounded-xl bg-white/5 border border-white/10 p-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-accent/50 transition-all resize-none" />
              <button type="submit" className="mt-3 px-6 py-2 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-all">Submit Review</button>
            </form>
          ) : (
            <div className="mb-8 p-8 rounded-2xl glass border border-white/5 text-center">
              <Star className="w-8 h-8 text-white/10 mx-auto mb-4" />
              <p className="text-white/50 mb-4">You must be logged in to share your experience.</p>
              <Link href="/auth/login" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-bold transition-all">
                Sign In to Review <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.length > 0 ? reviews.map((review: any) => (
              <div key={review.id} className="p-6 rounded-2xl glass">
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-accent text-accent' : 'text-white/10'}`} />)}
                </div>
                {review.title && <p className="text-sm font-semibold text-white mb-1">{review.title}</p>}
                <p className="text-sm text-white/60 leading-relaxed">{review.comment}</p>
                <div className="mt-4 flex items-center justify-between text-xs text-white/30">
                  <span className="font-medium text-white/50">{review.User?.name || 'Anonymous'}</span>
                  <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            )) : <p className="text-white/30 text-sm">No reviews yet. Be the first to review!</p>}
          </div>
        </motion.section>
      </div>
    </div>
  );
}