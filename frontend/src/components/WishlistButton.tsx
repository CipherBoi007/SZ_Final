'use client';

import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useWishlistStore } from '@/store/wishlistStore';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface WishlistButtonProps {
  productId: string;
  className?: string;
}

export default function WishlistButton({ productId, className = "" }: WishlistButtonProps) {
  const { isInWishlist, addItem, removeItem, getWishlistItemId } = useWishlistStore();
  const { token } = useAuthStore();
  const router = useRouter();

  const isFav = isInWishlist(productId);

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!token) {
      toast.error('Please login to add to wishlist');
      router.push('/auth/login');
      return;
    }

    try {
      if (isFav) {
        const id = getWishlistItemId(productId);
        if (id) await removeItem(id);
        toast.success('Removed from wishlist');
      } else {
        await addItem(productId);
        toast.success('Added to wishlist');
      }
    } catch (err) {
      toast.error('Failed to update wishlist');
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleWishlist}
      className={`absolute top-3 right-3 z-20 p-2.5 rounded-full transition-all duration-300 ${
        isFav 
          ? 'bg-accent text-white shadow-[0_0_15px_rgba(255,51,102,0.4)]' 
          : 'bg-black/20 hover:bg-black/40 text-white/70 hover:text-white backdrop-blur-md border border-white/10'
      } ${className}`}
    >
      <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
    </motion.button>
  );
}
