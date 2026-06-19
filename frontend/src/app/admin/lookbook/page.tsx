'use client';

import { useEffect, useState } from 'react';
import { ImageIcon, Trash2, UploadCloud, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminAPI } from '@/lib/api';

export default function AdminLookbook() {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchImages();
  }, []);

  async function fetchImages() {
    try {
      const { data } = await adminAPI.getLookbook();
      setImages(data.data || []);
    } catch {
      toast.error('Failed to load lookbook images');
    } finally {
      setLoading(false);
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);

    setUploading(true);
    try {
      const form = new FormData();
      files.forEach((file) => {
        form.append('images', file);
      });
      await adminAPI.addLookbookImages(form);
      toast.success(`${files.length} image(s) added to lookbook`);
      fetchImages();
    } catch {
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lookbook image?')) return;
    try {
      await adminAPI.deleteLookbookImage(id);
      toast.success('Image deleted');
      setImages(images.filter((img) => img.id !== id));
    } catch {
      toast.error('Failed to delete image');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6">
      <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      <p className="text-[9px] text-white/20 uppercase tracking-[0.6em]">Loading Gallery</p>
    </div>
  );

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <h1 className="text-4xl font-serif font-black text-white uppercase tracking-tight mb-2 text-glow">Lookbook</h1>
          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em]">Manage landing page gallery</p>
        </div>
        
        <label className={`flex items-center gap-3 px-8 py-4 rounded-2xl bg-accent hover:bg-accent-hover text-[11px] font-black text-white uppercase tracking-widest transition-all shadow-2xl cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : 'glow-red'}`}>
          {uploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
          {uploading ? 'Uploading...' : 'Upload Images'}
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {images.map((img) => (
          <div key={img.id} className="group relative aspect-[3/4] rounded-2xl overflow-hidden glass border border-white/5">
            <img src={img.imageUrl} alt="Lookbook" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <button onClick={() => handleDelete(img.id)} className="p-4 bg-red-500/20 text-red-400 hover:bg-red-500/40 hover:text-white rounded-full transition-all">
                <Trash2 className="w-6 h-6" />
              </button>
            </div>
          </div>
        ))}
        
        {images.length === 0 && (
          <div className="col-span-full py-32 text-center space-y-4 rounded-[40px] border border-dashed border-white/10 glass">
            <ImageIcon className="w-16 h-16 text-white/5 mx-auto" />
            <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.6em]">Gallery is empty</p>
          </div>
        )}
      </div>
    </div>
  );
}
