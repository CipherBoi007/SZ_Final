'use client';

import { useEffect, useState } from 'react';
import { 
  Megaphone, PlusCircle, PenLine, Trash2, 
  CheckCircle2, X, Image as ImageIcon, 
  Calendar, Link as LinkIcon, Star, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminAPI } from '@/lib/api';

/* ─── Promotion Page ────────────────────────────────────── */

export default function AdminPromotions() {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form State
  const [editId, setEditId] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    bannerImage: '',
    targetLink: '/shop',
    startDate: '',
    endDate: '',
    priority: 0,
    isActive: true
  });

  useEffect(() => {
    fetchPromotions();
    adminAPI.getCategories().then((res) => setCategories(res.data?.data || [])).catch(() => {});
  }, []);

  async function fetchPromotions() {
    try {
      const { data } = await adminAPI.getPromotions();
      setPromotions(data.data || []);
    } catch { 
      toast.error('Failed to load promotions');
    } finally {
      setLoading(false);
    }
  }

  const handleOpenModal = (promo?: any) => {
    if (promo) {
      setEditId(promo.id);
      setFormData({
        title: promo.title || '',
        subtitle: promo.subtitle || '',
        bannerImage: promo.bannerImage || '',
        targetLink: promo.targetLink || '/shop',
        startDate: promo.startDate ? promo.startDate.split('T')[0] : '',
        endDate: promo.endDate ? promo.endDate.split('T')[0] : '',
        priority: promo.priority || 0,
        isActive: promo.isActive !== false
      });
    } else {
      setEditId(null);
      setFormData({ 
        title: '', 
        subtitle: '', 
        bannerImage: '', 
        targetLink: '/shop', 
        startDate: '', 
        endDate: '', 
        priority: 0, 
        isActive: true 
      });
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const form = new FormData();
      form.append('title', formData.title);
      form.append('subtitle', formData.subtitle);
      form.append('targetLink', formData.targetLink);
      form.append('startDate', formData.startDate);
      form.append('endDate', formData.endDate);
      form.append('priority', formData.priority.toString());
      form.append('isActive', formData.isActive.toString());
      if (imageFile) form.append('image', imageFile);

      if (editId) {
        await adminAPI.updatePromotion(editId, form as any);
        toast.success('Promotion updated');
      } else {
        await adminAPI.createPromotion(form as any);
        toast.success('Promotion created');
      }
      setIsModalOpen(false);
      fetchPromotions();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Promotion save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promotion? This cannot be undone.')) return;
    try {
      await adminAPI.deletePromotion(id);
      toast.success('Promotion deleted');
      setPromotions(promotions.filter((p) => p.id !== id));
    } catch {
      toast.error('Failed to delete promotion');
    }
  };

  const toggleStatus = async (promo: any) => {
    try {
      await adminAPI.updatePromotion(promo.id, { isActive: !promo.isActive });
      setPromotions(promotions.map(p => p.id === promo.id ? { ...p, isActive: !promo.isActive } : p));
      toast.success(promo.isActive ? 'Promotion deactivated' : 'Promotion activated');
    } catch {
      toast.error('Status toggle failed');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6">
      <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      <p className="text-[9px] text-white/20 uppercase tracking-[0.6em]">Loading Promotions</p>
    </div>
  );

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <h1 className="text-4xl font-serif font-black text-white uppercase tracking-tight mb-2 text-glow">Promotions</h1>
          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em]">Manage promotional banners</p>
        </div>
        <button onClick={() => handleOpenModal()} className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-accent hover:bg-accent-hover text-[11px] font-black text-white uppercase tracking-widest transition-all glow-red shadow-2xl">
          <PlusCircle className="w-4 h-4" /> Create Promotion
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:gap-8">
        {promotions.map((promo) => (
          <div key={promo.id} className={`rounded-3xl glass-strong border border-white/5 overflow-hidden group transition-all duration-500 ${!promo.isActive ? 'opacity-50 grayscale' : ''}`}>
            {/* Banner Preview */}
            <div className="relative h-32 sm:h-64 bg-white/5 overflow-hidden">
              {promo.bannerImage ? (
                <img src={promo.bannerImage} alt={promo.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 sm:w-12 sm:h-12 text-white/5" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
              
              <div className="absolute top-3 left-3 sm:top-6 sm:left-6 flex gap-2">
                <span className={`px-2 py-0.5 sm:px-4 sm:py-1.5 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest border border-white/10 backdrop-blur-md ${
                  promo.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {promo.isActive ? 'Active' : 'Off'}
                </span>
              </div>

              <div className="absolute bottom-3 left-3 right-3 sm:bottom-6 sm:left-6 sm:right-6">
                <h3 className="text-sm sm:text-2xl font-serif font-black text-white mb-0.5 sm:mb-1 uppercase tracking-tight line-clamp-1">{promo.title}</h3>
                <p className="text-[8px] sm:text-[11px] text-white/60 font-medium uppercase tracking-widest line-clamp-1">{promo.subtitle}</p>
              </div>
            </div>
            
            <div className="p-4 sm:p-8">
              <div className="hidden sm:grid grid-cols-2 gap-6 mb-8 pb-8 border-b border-white/5">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Target Link</p>
                  <p className="text-xs text-white/70 font-mono truncate flex items-center gap-2">
                    <LinkIcon className="w-3 h-3 text-accent" /> {promo.targetLink}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Duration</p>
                  <p className="text-xs text-white/70 flex items-center gap-2 font-mono">
                    <Calendar className="w-3 h-3 text-accent" /> 
                    {promo.startDate ? new Date(promo.startDate).toLocaleDateString() : '∞'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between gap-2">
                <button onClick={() => toggleStatus(promo)} className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest transition-colors text-white/20 hover:text-white truncate">
                  {promo.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleOpenModal(promo)} className="p-2 sm:p-4 rounded-xl glass border border-white/5 text-white/40 hover:text-white transition-all">
                    <PenLine className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                  <button onClick={() => handleDelete(promo.id)} className="p-2 sm:p-4 rounded-xl glass border border-white/5 text-white/40 hover:text-red-400 transition-all">
                    <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {promotions.length === 0 && (
          <div className="col-span-full py-32 text-center space-y-4 rounded-[40px] border border-dashed border-white/10">
            <Megaphone className="w-16 h-16 text-white/5 mx-auto" />
            <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.6em]">No Promotions Found</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-xl bg-surface border border-white/10 rounded-[40px] shadow-2xl z-10 p-10 overflow-hidden">
            <div className={`absolute -right-20 -top-20 w-64 h-64 bg-accent opacity-[0.05] blur-[100px] rounded-full`} />
            
            <div className="flex items-center justify-between mb-10 relative z-10">
              <div>
                <h2 className="text-3xl font-serif font-black text-white uppercase tracking-tight">{editId ? 'Edit Promotion' : 'Create Promotion'}</h2>
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mt-1">Promotion details</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-4 text-white/20 hover:text-white rounded-2xl glass transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-white/20 tracking-widest">Title</label>
                  <input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required className="w-full py-4 px-6 rounded-2xl bg-white/5 border border-white/5 text-sm text-white focus:border-accent/30 outline-none transition-all" placeholder="Campaign Title" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-white/20 tracking-widest">Subtitle</label>
                  <input value={formData.subtitle} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} className="w-full py-4 px-6 rounded-2xl bg-white/5 border border-white/5 text-sm text-white focus:border-accent/30 outline-none transition-all" placeholder="Short description" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-white/20 tracking-widest">Banner Image</label>
                <div className="relative group">
                  <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="w-full py-4 pl-6 pr-6 rounded-2xl bg-white/5 border border-white/5 text-sm text-white focus:border-accent/30 outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-accent/10 file:text-accent hover:file:bg-accent/20 cursor-pointer" />
                  {formData.bannerImage && !imageFile && <p className="text-xs text-white/50 mt-2 ml-2">Current: {formData.bannerImage}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-white/20 tracking-widest">Target Link</label>
                  <select value={formData.targetLink} onChange={(e) => setFormData({ ...formData, targetLink: e.target.value })} className="w-full py-4 px-6 rounded-2xl bg-[#0f0f0f] border border-white/5 text-sm text-white focus:border-accent/30 outline-none transition-all">
                    <option value="/shop">All Shop</option>
                    <option value="/shop/new-arrivals">New Arrivals</option>
                    <option value="/shop/trending">Trending Now</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={`/shop?category=${cat.id}`}>Category: {cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-white/20 tracking-widest">Priority Weight</label>
                  <input type="number" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })} className="w-full py-4 px-6 rounded-2xl bg-white/5 border border-white/5 text-sm text-white focus:border-accent/30 outline-none transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-white/20 tracking-widest">Start Date</label>
                  <input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className="w-full py-4 px-6 rounded-2xl bg-white/5 border border-white/5 text-sm text-white focus:border-accent/30 outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-white/20 tracking-widest">End Date</label>
                  <input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} className="w-full py-4 px-6 rounded-2xl bg-white/5 border border-white/5 text-sm text-white focus:border-accent/30 outline-none transition-all" />
                </div>
              </div>

              <button type="submit" disabled={saving} className="w-full mt-6 flex items-center justify-center gap-3 px-8 py-5 rounded-2xl bg-accent hover:bg-accent-hover text-white text-sm font-black uppercase tracking-widest transition-all glow-red disabled:opacity-50 shadow-2xl">
                {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                {editId ? 'Save Changes' : 'Create Promotion'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
