'use client';

import { useEffect, useState } from 'react';
import { Star, Trash2, MessageSquare, Package, User, Calendar, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminAPI } from '@/lib/api';

/* ─── Admin Reviews ──────────────────────────────────────── */

export default function AdminReviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  async function fetchReviews() {
    try {
      const { data } = await adminAPI.getAllReviews();
      setReviews(data.data || []);
    } catch {
      toast.error('Failed to sync reviews');
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this feedback?')) return;
    try {
      await adminAPI.deleteReview(id);
      toast.success('Review deleted');
      setReviews(reviews.filter((r) => r.id !== id));
    } catch {
      toast.error('Deletion failed');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6">
      <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      <p className="text-[9px] text-white/20 uppercase tracking-[0.6em]">Loading Reviews</p>
    </div>
  );

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <h1 className="text-4xl font-serif font-black text-white uppercase tracking-tight mb-2">Reviews</h1>
          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em]">Moderate store customer reviews</p>
        </div>
        <button onClick={fetchReviews} className="flex items-center gap-3 px-6 py-3 rounded-2xl glass hover:bg-white/5 text-[10px] font-black text-white uppercase tracking-widest transition-all">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="p-6 sm:p-8 rounded-[32px] glass-strong border border-white/5 group hover:border-white/10 transition-all duration-500">
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-4">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-accent text-accent' : 'text-white/5'}`} />
                    ))}
                  </div>
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-widest flex items-center gap-2">
                    <Calendar className="w-3 h-3" /> {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <div>
                  <h3 className="text-lg font-serif font-black text-white uppercase tracking-tight mb-2">"{review.comment}"</h3>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2 text-[10px] font-black text-white/40 uppercase tracking-widest">
                      <User className="w-3.5 h-3.5 text-accent" /> {review.User?.name || 'Customer'}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-white/40 uppercase tracking-widest">
                      <Package className="w-3.5 h-3.5 text-accent" /> {review.Product?.name || 'Product'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end">
                <button onClick={() => handleDelete(review.id)} className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 transition-all">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {reviews.length === 0 && (
          <div className="py-32 text-center space-y-4 rounded-[40px] border border-dashed border-white/10">
            <MessageSquare className="w-16 h-16 text-white/5 mx-auto" />
            <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.6em]">No Reviews Found</p>
          </div>
        )}
      </div>
    </div>
  );
}
