'use client';

import { useState, useEffect } from 'react';
import { X, Upload, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminAPI } from '@/lib/api';

/* eslint-disable @typescript-eslint/no-explicit-any */

interface VariantRow {
  size: string;
  color: string;
  price: string;
  stock: string;
  sku: string;
}

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
}

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

export default function AddProductModal({ isOpen, onClose, onSuccess, initialData }: AddProductModalProps) {
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    description: '',
    material: '',
    discount: '0',
    categoryId: '',
  });
  
  const [variants, setVariants] = useState<VariantRow[]>([
    { size: 'M', color: '', price: '', stock: '', sku: '' },
  ]);
  
  const [images, setImages] = useState<File[]>([]);

  useEffect(() => {
    if (isOpen) {
      adminAPI.getCategories().then((res) => setCategories(res.data?.data || [])).catch(() => {});
      if (initialData) {
        setFormData({
          name: initialData.name || '',
          brand: initialData.brand || '',
          description: initialData.description || '',
          material: initialData.material || '',
          discount: initialData.discount?.toString() || '0',
          categoryId: initialData.categoryId || '',
        });
        // Load existing variants if editing
        if (initialData.variants && initialData.variants.length > 0) {
          setVariants(initialData.variants.map((v: any) => ({
            size: v.size || 'M',
            color: v.color || '',
            price: v.price?.toString() || '',
            stock: v.stock?.toString() || '',
            sku: v.sku || '',
          })));
        } else {
          setVariants([{ size: 'M', color: '', price: '', stock: '', sku: '' }]);
        }
      } else {
        setFormData({ name: '', brand: '', description: '', material: '', discount: '0', categoryId: '' });
        setVariants([{ size: 'M', color: '', price: '', stock: '', sku: '' }]);
      }
      setImages([]);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const addVariant = () => {
    setVariants([...variants, { size: 'M', color: '', price: '', stock: '', sku: '' }]);
  };

  const removeVariant = (idx: number) => {
    if (variants.length <= 1) {
      toast.error('At least one variant is required');
      return;
    }
    setVariants(variants.filter((_, i) => i !== idx));
  };

  const updateVariant = (idx: number, field: keyof VariantRow, value: string) => {
    const updated = [...variants];
    updated[idx] = { ...updated[idx], [field]: value };
    setVariants(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate variants
    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      if (!v.color.trim()) {
        toast.error(`Variant ${i + 1}: Color is required`);
        return;
      }
      if (!v.price || Number(v.price) <= 0) {
        toast.error(`Variant ${i + 1}: Valid price is required`);
        return;
      }
      if (!v.stock || Number(v.stock) < 0) {
        toast.error(`Variant ${i + 1}: Stock is required`);
        return;
      }
    }

    setSaving(true);
    try {
      const form = new FormData();
      form.append('name', formData.name);
      form.append('brand', formData.brand);
      form.append('description', formData.description);
      form.append('material', formData.material);
      form.append('discount', formData.discount);
      form.append('categoryId', formData.categoryId);
      form.append('variants', JSON.stringify(variants.map((v) => ({
        size: v.size,
        color: v.color.trim(),
        price: Number(v.price),
        stock: Number(v.stock),
        sku: v.sku.trim() || undefined,
      }))));
      images.forEach((img) => form.append('images', img));

      if (initialData?.id) {
        await adminAPI.updateProduct(initialData.id.toString(), form as any);
        toast.success('Product updated successfully!');
      } else {
        await adminAPI.createProduct(form as any);
        toast.success('Product created successfully!');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || `Failed to ${initialData ? 'update' : 'create'} product`);
    } finally {
      setSaving(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-surface border border-white/10 rounded-2xl shadow-2xl z-10">
        <div className="sticky top-0 bg-surface/80 backdrop-blur-xl border-b border-white/5 p-6 flex items-center justify-between z-20">
          <h2 className="text-xl font-bold text-white">{initialData ? 'Edit Product' : 'Add New Product'}</h2>
          <button onClick={onClose} className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="text-sm font-bold text-white/70 mb-4">Product Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-white/50">Product Name</label>
                <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="w-full py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:border-accent/50 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-white/50">Brand</label>
                <input value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} required className="w-full py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:border-accent/50 outline-none" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-xs font-semibold uppercase text-white/50">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required rows={3} className="w-full py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:border-accent/50 outline-none resize-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-white/50">Category</label>
                <select value={formData.categoryId} onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })} required className="w-full py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:border-accent/50 outline-none [&>option]:bg-background">
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-white/50">Discount (%)</label>
                <input type="number" min="0" max="100" value={formData.discount} onChange={(e) => setFormData({ ...formData, discount: e.target.value })} className="w-full py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:border-accent/50 outline-none" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-xs font-semibold uppercase text-white/50">Material (Optional)</label>
                <input value={formData.material} onChange={(e) => setFormData({ ...formData, material: e.target.value })} className="w-full py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:border-accent/50 outline-none" />
              </div>
            </div>
          </div>

          {/* Variants */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white/70">Product Variants</h3>
              <button type="button" onClick={addVariant} className="flex items-center gap-1 text-xs text-accent hover:text-accent-hover font-semibold transition-colors">
                <Plus className="w-3 h-3" /> Add Variant
              </button>
            </div>
            
            <div className="space-y-3">
              {variants.map((variant, idx) => (
                <div key={idx} className="flex flex-wrap gap-3 p-4 rounded-xl bg-white/5 border border-white/10 items-end">
                  <div className="flex-1 min-w-[80px] space-y-1">
                    <label className="text-[10px] font-semibold uppercase text-white/40">Size</label>
                    <select value={variant.size} onChange={(e) => updateVariant(idx, 'size', e.target.value)}
                      className="w-full py-2 px-3 rounded-lg bg-white/5 border border-white/10 text-xs text-white outline-none [&>option]:bg-background">
                      {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="flex-1 min-w-[100px] space-y-1">
                    <label className="text-[10px] font-semibold uppercase text-white/40">Color</label>
                    <input value={variant.color} onChange={(e) => updateVariant(idx, 'color', e.target.value)} required placeholder="Black" 
                      className="w-full py-2 px-3 rounded-lg bg-white/5 border border-white/10 text-xs text-white placeholder:text-white/20 outline-none" />
                  </div>
                  <div className="flex-1 min-w-[80px] space-y-1">
                    <label className="text-[10px] font-semibold uppercase text-white/40">Price (₹)</label>
                    <input type="number" min="0" value={variant.price} onChange={(e) => updateVariant(idx, 'price', e.target.value)} required placeholder="899"
                      className="w-full py-2 px-3 rounded-lg bg-white/5 border border-white/10 text-xs text-white placeholder:text-white/20 outline-none" />
                  </div>
                  <div className="flex-1 min-w-[60px] space-y-1">
                    <label className="text-[10px] font-semibold uppercase text-white/40">Stock</label>
                    <input type="number" min="0" value={variant.stock} onChange={(e) => updateVariant(idx, 'stock', e.target.value)} required placeholder="50"
                      className="w-full py-2 px-3 rounded-lg bg-white/5 border border-white/10 text-xs text-white placeholder:text-white/20 outline-none" />
                  </div>
                  <div className="flex-1 min-w-[80px] space-y-1">
                    <label className="text-[10px] font-semibold uppercase text-white/40">SKU</label>
                    <input value={variant.sku} onChange={(e) => updateVariant(idx, 'sku', e.target.value)} placeholder="Auto"
                      className="w-full py-2 px-3 rounded-lg bg-white/5 border border-white/10 text-xs text-white placeholder:text-white/20 outline-none" />
                  </div>
                  <button type="button" onClick={() => removeVariant(idx)} className="p-2 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-colors shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Images */}
          <div className="space-y-4 p-6 rounded-xl border border-white/10 bg-white/5 border-dashed text-center">
            <Upload className="w-8 h-8 text-white/30 mx-auto mb-2" />
            <p className="text-sm text-white/60 mb-4">Upload Product Images (Max 5)</p>
            <input type="file" multiple accept="image/*" onChange={handleImageChange} className="text-sm text-white/50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent/10 file:text-accent hover:file:bg-accent/20 transition-all cursor-pointer" />
            {images.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-emerald-400 mb-3">{images.length} files selected</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {images.map((file, i) => (
                    <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-white/20">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-white/5 flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-accent hover:bg-accent-hover text-white font-bold transition-all glow-red-hover disabled:opacity-50">
              {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
              {saving ? (initialData ? 'Updating...' : 'Creating...') : (initialData ? 'Save Changes' : 'Create Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
