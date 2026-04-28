'use client';

import { useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { checkAuth } = useAuthStore();
  const authInitiated = useRef(false);

  useEffect(() => {
    if (authInitiated.current) return;

    const token = searchParams.get('token');

    if (token) {
      authInitiated.current = true;
      const setTokenAndVerify = async () => {
        try {
          useAuthStore.setState({ token, isLoading: true });
          await checkAuth();
          toast.success('Google Login Successful!');
          router.replace('/shop');
        } catch (err) {
          console.error('Auth verification failed', err);
          toast.error('Failed to verify authentication');
          router.replace('/auth/login');
        }
      };

      setTokenAndVerify();
    } else {
      toast.error('No token found in callback');
      router.replace('/auth/login');
    }
  }, [searchParams, checkAuth, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-white">
      <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-white/60 animate-pulse">Authenticating with Google...</p>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-white">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-white/60">Loading...</p>
      </div>
    }>
      <GoogleCallbackContent />
    </Suspense>
  );
}
