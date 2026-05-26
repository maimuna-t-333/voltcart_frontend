'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, ArrowLeft, ArrowRight, Zap, Sparkles } from 'lucide-react';
import Image from 'next/image';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import PageTransition from '@/components/layout/PageTransition';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema, type ResetPasswordFormData } from '@/lib/validations/auth.schemas';

const taglines = [
  'Time for a fresh start',
  'New password, same great gear',
  'Almost there!',
];

export default function ResetPasswordForm() {
  const searchParams                    = useSearchParams();
  const router                          = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [taglineIdx, setTaglineIdx]     = useState(0);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const {register, handleSubmit, formState: { errors }} = useForm<ResetPasswordFormData>({
  resolver: zodResolver(resetPasswordSchema)});

  useEffect(() => {
    const iv = setInterval(() => setTaglineIdx(i => (i + 1) % taglines.length), 4000);
    return () => clearInterval(iv);
  }, []);

  const onSubmit = async (data: ResetPasswordFormData) => {
  const token = searchParams.get('token');
  if (!token) {
    toast.error('Invalid reset link');
    return;
  }
  setLoading(true);
  try {
    await api.post('/auth/reset-password', { token, password: data.password });
    toast.success('Password reset! Please log in.');
    router.push('/auth/login');
  } catch (err: any) {
    toast.error(err.response?.data?.message || 'Reset failed. The link may have expired.');
  } finally {
    setLoading(false);
  }
};

  return (
    <PageTransition>
      <div className='relative min-h-screen flex items-stretch auth-page'>
        {/* Brand Panel */}
        <div className='hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center overflow-hidden auth-brand-panel'>
          <div className='absolute inset-0 auth-brand-grid' />
          <div className='absolute inset-0 auth-brand-glow' />
          <div className='absolute inset-0 overflow-hidden'>
            {[...Array(10)].map((_, i) => (
              <motion.div key={i} className='absolute w-1 h-1 rounded-full auth-particle'
                style={{ left: `${10 + (i * 9) % 80}%`, top: `${5 + (i * 13) % 90}%` }}
                animate={{ y: [0, -20, 0], opacity: [0.2, 0.6, 0.2] }}
                transition={{ duration: 3 + (i % 3), repeat: Infinity, delay: i * 0.6, ease: 'easeInOut' }}
              />
            ))}
          </div>
          <div className='relative z-10 flex flex-col items-center text-center px-12'>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className='flex items-center gap-2 mb-6'>
              <div className='flex items-center justify-center w-12 h-12 rounded-2xl auth-brand-logo'>
                <Zap size={22} className='text-white' />
              </div>
              <span className='text-2xl font-bold auth-brand-name'>VoltCart</span>
            </motion.div>
            <AnimatePresence mode='wait'>
              <motion.p key={taglineIdx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }}
                className='text-lg font-medium auth-tagline flex items-center gap-2'>
                {taglines[taglineIdx]}
                <Sparkles size={14} className='inline' />
              </motion.p>
            </AnimatePresence>
            <motion.div className='relative mt-10 w-full max-w-[320px] aspect-[4/3]'
              animate={{ y: [0, -8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}>
              <motion.div className='relative w-full h-full' style={{ perspective: '1200px' }}
                animate={{ rotateY: [-6, 6, -6], rotateX: [2, -2, 2] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}>
                <Image src='/laptop.png' alt='Featured gadget' fill priority sizes='320px' className='object-contain drop-shadow-2xl' unoptimized />
              </motion.div>
              <div className='absolute -bottom-4 left-[10%] right-[10%] h-6 rounded-full blur-xl auth-product-shadow' />
            </motion.div>
          </div>
        </div>

        {/* Form Panel */}
        <div className='flex-1 flex items-center justify-center px-5 py-12 auth-form-panel'>
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className='w-full max-w-sm'>
            <div className='flex items-center gap-2 mb-8 lg:hidden'>
              <div className='flex items-center justify-center w-10 h-10 rounded-xl auth-brand-logo'>
                <Zap size={18} className='text-white' />
              </div>
              <span className='text-lg font-bold auth-brand-name'>VoltCart</span>
            </div>

            <motion.h1 className='text-[28px] font-bold leading-tight auth-heading'
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              Set new password
            </motion.h1>
            <motion.p className='text-sm mt-1.5 mb-8 auth-sub'
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              Must be at least 8 characters
            </motion.p>

            <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <div className='relative auth-field-group'>
                  <Lock size={16} className='absolute left-4 top-1/2 -translate-y-1/2 auth-field-icon' />
                  <input {...register('password')} type={showPassword ? 'text' : 'password'} placeholder='New password' autoComplete='new-password'
                    onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)}
                    className='w-full pl-11 pr-11 py-3.5 rounded-xl text-sm outline-none transition-all duration-200 auth-field'
                    style={{ border: '1px solid', borderColor: errors.password ? '#ef4444' : focusedField === 'password' ? 'var(--auth-accent)' : 'var(--auth-border)' }}
                  />
                  <button type='button' onClick={() => setShowPassword(!showPassword)}
                    className='absolute right-4 top-1/2 -translate-y-1/2 transition-colors duration-200 auth-field-icon'>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className='text-red-400 text-xs mt-1.5 pl-1'>{errors.password.message}</p>}
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <div className='relative auth-field-group'>
                  <Lock size={16} className='absolute left-4 top-1/2 -translate-y-1/2 auth-field-icon' />
                  <input {...register('confirm')} type={showPassword ? 'text' : 'password'} placeholder='Confirm password' autoComplete='new-password'
                    onFocus={() => setFocusedField('confirm')} onBlur={() => setFocusedField(null)}
                    className='w-full pl-11 pr-4 py-3.5 rounded-xl text-sm outline-none transition-all duration-200 auth-field'
                    style={{ border: '1px solid', borderColor: errors.confirm ? '#ef4444' : focusedField === 'confirm' ? 'var(--auth-accent)' : 'var(--auth-border)' }}
                  />
                </div>
                {errors.confirm && <p className='text-red-400 text-xs mt-1.5 pl-1'>{errors.confirm.message}</p>}
              </motion.div>

              <motion.button type='submit' disabled={loading}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className='auth-btn w-full font-bold py-3.5 rounded-xl text-sm transition-all duration-200 disabled:opacity-40 flex items-center justify-center gap-2'>
                <span>{loading ? 'Resetting...' : 'Reset Password'}</span>
                <ArrowRight size={16} strokeWidth={2.5} />
              </motion.button>
            </form>

            <motion.div className='mt-8 text-center' initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
              <Link href='/auth/login' className='inline-flex items-center gap-2 text-sm auth-muted-link'>
                <ArrowLeft size={14} /> Back to Login
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <style>{`
        .auth-page { background: var(--auth-bg); }
        .auth-brand-panel { background: var(--auth-brand-bg); }
        .auth-brand-grid {
          background-image: linear-gradient(var(--auth-grid) 1px, transparent 1px), linear-gradient(90deg, var(--auth-grid) 1px, transparent 1px);
          background-size: 48px 48px;
        }
        .auth-brand-glow { background: radial-gradient(ellipse at center, var(--auth-orb) 0%, transparent 70%); opacity: 0.15; }
        .auth-particle { background: var(--auth-accent); }
        .auth-brand-logo { background: linear-gradient(135deg, #6366f1, #4f46e5); box-shadow: 0 4px 16px rgba(99,102,241,0.25); }
        .auth-brand-name { color: var(--auth-text); }
        .auth-tagline { color: var(--auth-muted); }
        .auth-product-shadow { background: radial-gradient(ellipse, var(--auth-accent) 0%, transparent 70%); }
        .auth-form-panel { background: var(--auth-form-bg); }
        .auth-heading { color: var(--auth-text); }
        .auth-sub { color: var(--auth-muted); }
        .auth-field { color: var(--auth-text); background: var(--auth-field-bg); }
        .auth-field::placeholder { color: var(--auth-muted); }
        .auth-field-icon { color: var(--auth-muted); pointer-events: none; }
        .auth-muted-link { color: var(--auth-muted); }
        .auth-muted-link:hover { color: var(--auth-accent); }
        .auth-btn {
          color: #fff;
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          box-shadow: 0 4px 16px rgba(99,102,241,0.3);
        }
        .auth-btn:hover:not(:disabled) { filter: brightness(1.08); box-shadow: 0 6px 24px rgba(99,102,241,0.4); }

        :root {
          --auth-bg: #f4f4fa;
          --auth-brand-bg: #eeecf8;
          --auth-form-bg: #ffffff;
          --auth-grid: rgba(99,102,241,0.05);
          --auth-orb: #6366f1;
          --auth-accent: #6366f1;
          --auth-accent-hover: #4f46e5;
          --auth-text: #111111;
          --auth-muted: #9999aa;
          --auth-border: #e0e0ec;
          --auth-field-bg: rgba(0,0,0,0.02);
        }
        .dark {
          --auth-bg: #08080e;
          --auth-brand-bg: #0c0c16;
          --auth-form-bg: #08080e;
          --auth-grid: rgba(129,140,248,0.04);
          --auth-orb: #818cf8;
          --auth-accent: #818cf8;
          --auth-accent-hover: #6366f1;
          --auth-text: #e8e8f0;
          --auth-muted: #6b6b8a;
          --auth-border: #1e1e30;
          --auth-field-bg: rgba(255,255,255,0.03);
        }
      `}</style>
    </PageTransition>
  );
}
