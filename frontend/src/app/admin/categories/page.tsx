'use client';

import { useEffect, useState } from 'react';
import { Library, PlusCircle, PenLine, Trash2, CheckCircle2, X, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminAPI } from '@/lib/api';

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form State
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'men',
    description: '',
    image: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const { data } = await adminAPI.getCategories();
      const payload = data.data;
      setCategories(payload?.categories || (Array.isArray(payload) ? payload : []));
    } catch { 
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }

  const handleOpenModal = (category?: any) => {
    if (category) {
      setEditId(category.id);
      setFormData({
        name: category.name || '',
        type: category.type || 'men',
        description: category.description || '',
        image: category.image || '',
      });
    } else {
      setEditId(null);
      setFormData({ name: '', type: 'men', description: '', image: '' });
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('type', formData.type);
      payload.append('description', formData.description);
      
      if (imageFile) {
        payload.append('image', imageFile);
      } else if (formData.image) {
        payload.append('image', formData.image);
      }

      if (editId) {
        await adminAPI.updateCategory(editId, payload);
        toast.success('Category updated successfully');
      } else {
        await adminAPI.createCategory(payload);
        toast.success('Category created successfully');
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await adminAPI.deleteCategory(id);
      toast.success('Category deleted');
      setCategories(categories.filter((c) => c.id !== id));
    } catch {
      toast.error('Failed to delete category');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Categories</h1>
        <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-semibold transition-all glow-red-hover">
          <PlusCircle className="w-4 h-4" /> Add Category
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {categories.map((cat) => (
            <div key={cat.id} className="rounded-2xl glass-strong border border-white/5 overflow-hidden group">
              <div className="relative h-28 sm:h-40 bg-white/5 overflow-hidden">
                {cat.image ? (
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Library className="w-10 h-10 text-white/5" />
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <span className="inline-block px-3 py-1 rounded-md text-[10px] font-black tracking-wider bg-black/60 backdrop-blur-md text-white uppercase border border-white/10">
                    {cat.type}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">{cat.name}</h3>
                {cat.description && <p className="text-sm text-white/50 mb-6 line-clamp-2">{cat.description}</p>}
                
                <div className="pt-4 border-t border-white/5 flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleOpenModal(cat)} className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors">
                    <PenLine className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(cat.id)} className="p-2 rounded-lg text-white/50 hover:text-red-400 hover:bg-red-400/10 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {categories.length === 0 && (
            <div className="col-span-full p-12 text-center text-white/20 border border-white/5 border-dashed rounded-2xl">
              <Library className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No categories created yet</p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-md bg-surface border border-white/10 rounded-2xl shadow-2xl z-10 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">{editId ? 'Edit Category' : 'Create Category'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-white/50 hover:text-white rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-white/50">Name</label>
                <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="w-full py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:border-accent/50 outline-none" />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-white/50">Parent Type</label>
                <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:border-accent/50 outline-none [&>option]:bg-background">
                  <option value="men">Men</option>
                  <option value="kids">Kids</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-white/50">Category Image</label>
                <div className="relative border border-white/10 border-dashed rounded-xl p-4 text-center hover:bg-white/5 transition-colors cursor-pointer" onClick={() => document.getElementById('category-image-upload')?.click()}>
                  <input 
                    id="category-image-upload"
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setImageFile(e.target.files[0]);
                      }
                    }} 
                  />
                  {(imageFile || formData.image) ? (
                    <div className="relative w-full h-32 rounded-lg overflow-hidden border border-white/10 group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imageFile ? URL.createObjectURL(imageFile) : formData.image} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <p className="text-xs font-bold text-white uppercase tracking-wider">Change Image</p>
                      </div>
                    </div>
                  ) : (
                    <div className="py-6 flex flex-col items-center">
                      <Upload className="w-8 h-8 text-white/20 mb-2" />
                      <p className="text-xs text-white/50 font-medium">Click to upload category image</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-white/50">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:border-accent/50 outline-none resize-none" />
              </div>

              <button type="submit" disabled={saving} className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-accent hover:bg-accent-hover text-white font-bold transition-all glow-red-hover disabled:opacity-50">
                {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                {editId ? 'Save Changes' : 'Create Category'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
