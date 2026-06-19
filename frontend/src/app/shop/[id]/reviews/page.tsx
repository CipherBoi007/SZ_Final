'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, ChevronLeft, ArrowRight, MessageSquare, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { productAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

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

export default function ProductReviewsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const { token } = useAuthStore();

  const fetchProductData = async () => {
    try {
      const { data } = await productAPI.getById(id as string);
      setProduct(data.data);
    } catch {
      toast.error('Product not found');
      router.push('/shop');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (id) fetchProductData();
  }, [id]);

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

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  if (!product) return null;

  const reviews = product.reviews || [];

  return (
    <div className="min-h-screen bg-black pt-24 lg:pt-32 pb-32">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-20 border-b border-white/5 pb-12">
          <div className="flex items-center gap-6">
            <Link href={`/shop/${product.id}`} className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all">
              <ChevronLeft className="w-5 h-5 text-white" />
            </Link>
            <div>
              <h1 className="text-4xl font-serif font-black text-white uppercase tracking-tight mb-2">Evaluations</h1>
              <p className="text-[10px] text-white/30 uppercase tracking-[0.4em] font-medium">Verified Social Proof for <span className="text-white">{product.name}</span></p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <StarRating rating={product.rating || 0} count={reviews.length} />
            <p className="text-[9px] text-accent font-black uppercase tracking-widest mt-2">Overall Quality Score</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          {/* Left: Review List - Only show if reviews exist */}
          {reviews.length > 0 && (
            <div className="lg:col-span-7 space-y-8">
              <h3 className="text-[11px] font-black text-white/20 uppercase tracking-[0.5em] mb-12">Guest Archive</h3>
              {reviews.map((review: any) => (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} key={review.id} className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs font-black">{review.User?.name?.[0] || 'G'}</div>
                      <div>
                        <p className="text-[11px] font-black text-white uppercase tracking-widest">{review.User?.name || 'Guest User'}</p>
                        <p className="text-[9px] text-white/20 uppercase tracking-widest mt-0.5">{new Date(review.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-accent text-accent' : 'text-white/5'}`} />)}
                    </div>
                  </div>
                  <p className="text-[15px] text-white/50 leading-relaxed italic">"{review.comment}"</p>
                </motion.div>
              ))}
            </div>
          )}

          {/* Right: Submission Form - Adjust span if list is hidden */}
          <div className={reviews.length > 0 ? "lg:col-span-5" : "lg:col-span-12 max-w-2xl mx-auto w-full"}>
            <div className="sticky top-32">
              {token ? (
                <div className="p-10 rounded-3xl bg-accent/5 border border-accent/10">
                  <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] mb-2">{reviews.length > 0 ? "Contribute to the Score" : "Be the first to evaluate"}</h3>
                  <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] mb-8 font-medium">Share your experience with the world</p>
                  <form onSubmit={handleReview}>
                    <div className="flex gap-3 mb-8">
                      {[1, 2, 3, 4, 5].map((r) => (
                        <button key={r} type="button" onClick={() => setReviewRating(r)} className="transition-transform hover:scale-125">
                          <Star className={`w-7 h-7 ${r <= reviewRating ? 'fill-accent text-accent' : 'text-white/10'}`} />
                        </button>
                      ))}
                    </div>
                    <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} required placeholder="Describe the silhouette, fit, and material feel..." rows={6} className="w-full rounded-2xl bg-black/60 border border-white/10 p-5 text-sm text-white placeholder:text-white/20 outline-none focus:border-accent transition-all resize-none mb-8" />
                    <button type="submit" className="w-full py-5 rounded-2xl bg-white text-black text-[11px] font-black uppercase tracking-[0.3em] hover:bg-accent hover:text-white transition-all shadow-2xl flex items-center justify-center gap-3">
                      <Send className="w-4 h-4" /> Post Evaluation
                    </button>
                  </form>
                </div>
              ) : (
                <div className="p-12 rounded-3xl bg-white/[0.02] border border-white/5 text-center">
                  <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] mb-4">Post-Purchase Sync</h3>
                  <p className="text-xs text-white/30 leading-relaxed mb-8">You must be signed in to contribute to our curated evaluation archive.</p>
                  <Link href="/auth/login" className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white/5 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                    Sign In <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}

              {/* Tips Section */}
              <div className="mt-8 p-8 rounded-3xl border border-white/5 bg-white/[0.01]">
                <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">Submission Guidelines</h4>
                <ul className="space-y-3">
                  {['Focus on material quality', 'Mention size & fit accuracy', 'Keep it objective and professional'].map((tip, i) => (
                    <li key={i} className="flex items-center gap-3 text-[11px] text-white/20 font-medium italic">
                      <div className="w-1 h-1 rounded-full bg-accent" /> {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
