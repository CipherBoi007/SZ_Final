'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { configAPI } from '@/lib/api';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function LookbookPage() {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    configAPI.getLookbook().then((res) => {
      setImages(res.data?.data || []);
    }).catch(() => {
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-background text-white selection:bg-accent selection:text-white">
      <Navbar />
      
      <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-8 text-sm font-semibold uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center mb-16">
          <h1 className="font-serif text-5xl sm:text-7xl font-black uppercase tracking-tighter gradient-text">Lookbook</h1>
          <p className="mt-4 text-white/50 font-medium uppercase tracking-[0.3em] text-xs sm:text-sm">Style Inspiration</p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center py-32">
            <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {images.map((img, i) => (
              <motion.div 
                key={img.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="break-inside-avoid"
              >
                <div className="relative group rounded-[2rem] overflow-hidden bg-white/5 border border-white/10">
                  <img 
                    src={img.imageUrl} 
                    alt={`Lookbook image ${i + 1}`}
                    className="w-full h-auto object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
