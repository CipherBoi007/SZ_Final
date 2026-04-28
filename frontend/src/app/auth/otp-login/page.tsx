'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, ArrowRight, ShieldCheck, Key, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { authAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export default function OTPLoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const [identifier, setIdentifier] = useState('');
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = method === 'email' ? { email: identifier } : { phone: identifier };
      await authAPI.sendOTP(payload);
      toast.success('OTP sent successfully!');
      setStep('verify');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('Please enter a 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      const payload = method === 'email' 
        ? { email: identifier, otp } 
        : { phone: identifier, otp };
      
      const { data } = await authAPI.verifyOTP(payload);
      setAuth(data.data.user, data.token);
      toast.success('Login successful!');
      router.push('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 py-20">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Link href="/auth/login" className="inline-flex items-center gap-2 text-xs text-white/30 hover:text-white transition-colors mb-6 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Login
        </Link>
        <div className="glass-strong p-8 rounded-3xl border border-white/5 relative overflow-hidden">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">
              {step === 'request' ? 'OTP Login' : 'Verify OTP'}
            </h2>
            <p className="text-white/50 text-sm">
              {step === 'request' 
                ? 'Enter your details to receive a 6-digit code' 
                : `We've sent a code to ${identifier}`}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === 'request' ? (
              <motion.form 
                key="request"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleRequestOTP} 
                className="space-y-6"
              >
                <div className="flex p-1 bg-white/5 rounded-2xl border border-white/5 mb-6">
                  <button
                    type="button"
                    onClick={() => { setMethod('email'); setIdentifier(''); }}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${method === 'email' ? 'bg-white text-black shadow-lg' : 'text-white/40 hover:text-white'}`}
                  >
                    <Mail className="w-3.5 h-3.5" /> Email
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMethod('phone'); setIdentifier(''); }}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${method === 'phone' ? 'bg-white text-black shadow-lg' : 'text-white/40 hover:text-white'}`}
                  >
                    <Phone className="w-3.5 h-3.5" /> Phone
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 ml-1">
                    {method === 'email' ? 'Email Address' : 'Phone Number'}
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-accent transition-colors">
                      {method === 'email' ? <Mail className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
                    </div>
                    <input
                      type={method === 'email' ? 'email' : 'tel'}
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder={method === 'email' ? 'name@example.com' : '98765 43210'}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/10 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !identifier}
                  className="w-full py-4 bg-accent hover:bg-accent-hover text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2 group disabled:opacity-50 glow-red"
                >
                  {loading ? 'Sending...' : 'Send OTP'}
                  {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                </button>
              </motion.form>
            ) : (
              <motion.form 
                key="verify"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleVerifyOTP} 
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 ml-1 text-center block">
                    Enter Verification Code
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-accent transition-colors">
                      <Key className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-center text-2xl tracking-[0.5em] font-mono placeholder:text-white/10 outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/10 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full py-4 bg-accent hover:bg-accent-hover text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2 group disabled:opacity-50 glow-red"
                >
                  {loading ? 'Verifying...' : 'Verify & Login'}
                  {!loading && <ShieldCheck className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                </button>

                <button
                  type="button"
                  onClick={() => setStep('request')}
                  className="w-full text-sm text-white/40 hover:text-white transition-colors"
                >
                  Change {method === 'email' ? 'email' : 'phone'}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="mt-10 pt-8 border-t border-white/5 text-center">
            <p className="text-white/40 text-sm">
              Remember your password?{' '}
              <Link href="/auth/login" className="text-white font-bold hover:text-accent transition-colors">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
