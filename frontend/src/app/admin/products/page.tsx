'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PlusCircle, PenLine, Trash2, Search, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { productAPI, adminAPI } from '@/lib/api';
import AddProductModal from './AddProductModal';

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchProducts(page);
  }, [page]);

  async function fetchProducts(currentPage: number) {
    setLoading(true);
    try {
      const { data } = await productAPI.getAll({ page: currentPage, limit: 10 });
      setProducts(data.data?.products || []);
      setTotalPages(data.data?.pagination?.pages || 1);
    } catch { 
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    try {
      await adminAPI.deleteProduct(id);
      setProducts(products.filter((p) => p.id.toString() !== id));
      toast.success('Product deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-serif font-black text-white uppercase tracking-tight mb-2">Showroom</h1>
          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em]">Global Boutique Collection Audit</p>
        </div>
        <button onClick={() => { setEditProduct(null); setIsModalOpen(true); }} className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-accent hover:bg-accent-hover text-[11px] font-black text-white uppercase tracking-widest transition-all glow-red shadow-2xl">
          <PlusCircle className="w-4 h-4" /> Add New Piece
        </button>
      </div>

      <div className="relative mb-8 group max-w-xl">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-accent transition-colors" />
        <input 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          placeholder="Search by Name or Category..."
          className="w-full rounded-2xl bg-white/5 border border-white/5 py-4 pl-14 pr-6 text-sm text-white placeholder:text-white/10 outline-none focus:border-accent/30 transition-all shadow-inner" 
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="space-y-4">
          {/* Mobile View: Catalog Strips */}
          <div className="md:hidden space-y-3">
            {filtered.map((product) => {
              const img = product.images?.find((im: any) => im.isPrimary) || product.images?.[0];
              const imgSrc = img?.url || img?.imageUrl || '/images/hero2.jpg';
              const variants = product.variants || [];
              const prices = variants.map((v: any) => Number(v.price)).filter((p: number) => p > 0);
              const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
              return (
                <div key={product.id} className="p-4 rounded-2xl glass-strong border border-white/5 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden relative shrink-0">
                    <Image src={imgSrc} alt="" fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-black text-white uppercase tracking-tight truncate">{product.name}</p>
                    <p className="text-[9px] text-white/20 font-black uppercase mt-0.5 tracking-widest">
                      {variants.length} Variants • ₹{minPrice.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setEditProduct(product); setIsModalOpen(true); }} className="p-3 rounded-xl glass border border-white/5 text-white/40"><PenLine className="w-4 h-4" /></button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block rounded-[32px] glass-strong border border-white/5 overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] border-b border-white/5">
                <th className="text-left p-8">Collection Piece</th>
                <th className="text-left p-8">Category</th>
                <th className="text-left p-8">Vault Price</th>
                <th className="text-left p-8">Stock</th>
                <th className="text-right p-8">Actions</th>
              </tr></thead>
              <tbody>
                {filtered.map((product) => {
                  const img = product.images?.find((im: any) => im.isPrimary) || product.images?.[0];
                  const imgSrc = img?.url || img?.imageUrl || '/images/hero2.jpg';
                  const variants = product.variants || [];
                  const totalStock = variants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0);
                  const prices = variants.map((v: any) => Number(v.price)).filter((p: number) => p > 0);
                  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
                  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
                  return (
                    <tr key={product.id} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors group">
                      <td className="p-8">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl overflow-hidden relative shrink-0 border border-white/5"><Image src={imgSrc} alt="" fill className="object-cover" /></div>
                          <div>
                            <span className="text-white font-black uppercase tracking-tight block">{product.name}</span>
                            <span className="text-[10px] text-white/20 font-black uppercase tracking-widest">{variants.length} Configurations</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-8 text-white/40 font-black uppercase tracking-widest">{product.Category?.name || '—'}</td>
                      <td className="p-8 text-white font-black font-mono">
                        {minPrice === maxPrice ? `₹${minPrice.toLocaleString()}` : `₹${minPrice.toLocaleString()} – ₹${maxPrice.toLocaleString()}`}
                      </td>
                      <td className="p-8">
                        <span className={`text-sm font-black font-mono ${totalStock > 10 ? 'text-emerald-400' : totalStock > 0 ? 'text-yellow-400' : 'text-red-400'}`}>{totalStock}</span>
                      </td>
                      <td className="p-8 text-right">
                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={() => { setEditProduct(product); setIsModalOpen(true); }} className="p-4 rounded-2xl glass border border-white/5 text-white/40 hover:text-white transition-all"><PenLine className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(product.id.toString())} className="p-4 rounded-2xl glass border border-white/5 text-white/40 hover:text-red-400 transition-all"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && <div className="p-8 text-center text-white/20"><Package className="w-8 h-8 mx-auto mb-2" /><p>No products found</p></div>}
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-6 border-t border-white/5 bg-white/[0.01] flex items-center justify-between">
              <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))} 
                  disabled={page === 1}
                  className="p-3 rounded-xl glass border border-white/5 text-white disabled:opacity-20 hover:bg-white/5 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                  disabled={page === totalPages}
                  className="p-3 rounded-xl glass border border-white/5 text-white disabled:opacity-20 hover:bg-white/5 transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <AddProductModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => fetchProducts(page)} 
        initialData={editProduct}
      />
    </div>
  );
}
