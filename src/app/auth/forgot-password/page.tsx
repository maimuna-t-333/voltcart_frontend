'use client';
import { useState } from'react';
import Link from'next/link';
import { motion, AnimatePresence } from'framer-motion';
import { Mail, ArrowLeft, ChevronRight, Shield, Star, Zap } from'lucide-react';
import api from'@/lib/axios';
import toast from'react-hot-toast';
import PageTransition from'@/components/layout/PageTransition';
import { useForm } from'react-hook-form';
import { zodResolver } from'@hookform/resolvers/zod';
import { forgotPasswordSchema, type ForgotPasswordFormData } from'@/lib/validations/auth.schemas';

const fadeUp = (i: number): any => ({
 initial: { opacity: 0, y: 16 },
 animate: {
 opacity: 1, y: 0,
 transition: { duration: 0.45, delay: 0.06 * i, ease: [0.16, 1, 0.3, 1] },
 },
});

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
 const [sent, setSent] = useState(false);
 const [focusedField, setFocusedField] = useState<string | null>(null);
 const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);
 const rippleId = { current: 0 };

 const { register, handleSubmit, watch, formState: { errors } } = useForm<ForgotPasswordFormData>({
 resolver: zodResolver(forgotPasswordSchema),
 });

 const emailValue = watch('email');

 const onSubmit = async (data: ForgotPasswordFormData) => {
 setLoading(true);
 try {
 await api.post('/auth/forgot-password', { email: data.email });
 setSent(true);
 toast.success('Reset email sent!');
 } catch (err: any) {
 toast.error(err.response?.data?.message ||'Something went wrong');
 } finally {
 setLoading(false);
 }
 };

 const addRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
 const rect = e.currentTarget.getBoundingClientRect();
 const id = rippleId.current++;
 setRipples(prev => [...prev, { x: e.clientX - rect.left, y: e.clientY - rect.top, id }]);
 setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 600);
 };

 const focusStyle = (field: string) => ({
 borderColor: errors[field as keyof typeof errors]
 ?'#ef4444'
 : focusedField === field ?'#6366f1' :'var(--auth-input-border)',
 boxShadow: focusedField === field && !errors[field as keyof typeof errors]
 ?'0 0 0 3px rgba(99,102,241,0.12)' :'none',
 } as React.CSSProperties);

 const fieldCx ='w-full h-11 px-4 rounded-xl text-sm outline-none transition-all duration-200';

 return (
 <PageTransition>
 <div
 className='relative min-h-[100dvh] flex items-center justify-center px-4 py-10 overflow-hidden'
 style={{ background:'var(--bg)' }}
>
 {/* page background glows */}
 <div aria-hidden className='pointer-events-none absolute inset-0 overflow-hidden'>
 <div className='absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full blur-[120px]'
 style={{ background:'rgba(99,102,241,0.08)' }} />
 <div className='absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full blur-[120px]'
 style={{ background:'rgba(139,92,246,0.07)' }} />
 <div className='hb-grid-overlay absolute inset-0 opacity-40' />
 </div>

 {/* card */}
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
 className='relative w-full max-w-[900px] rounded-3xl overflow-hidden flex shadow-2xl min-h-0'
 style={{ border:'1px solid var(--card-bdr)', background:'var(--card)' }}
>
 {/* ════════════ LEFT PANEL ════════════ */}
 <div className='hidden lg:flex lg:w-[42%] relative flex-col items-center justify-center overflow-hidden'
 style={{
      background:'linear-gradient(145deg, #eef2ff 0%, #e0e7ff 35%, #ede9fe 70%, #f0f4ff 100%)',
      }}
>
  <div className='absolute inset-0 pointer-events-none'
  style={{
    opacity: 0.35,
    backgroundImage:'linear-gradient(rgba(99,102,241,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.3) 1px, transparent 1px)',
    backgroundSize:'40px 40px',
  }}
  />
  <div className='absolute top-0 left-0 w-72 h-72 rounded-full blur-[90px] pointer-events-none'
    style={{ background:'rgba(99,102,241,0.15)' }} />
  <div className='absolute bottom-0 right-0 w-56 h-56 rounded-full blur-[80px] pointer-events-none'
    style={{ background:'rgba(139,92,246,0.12)' }} />
  <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full blur-[60px] pointer-events-none'
    style={{ background:'rgba(6,182,212,0.08)' }} />

 <motion.div
 initial={{ opacity: 0, y: 16 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
 className='relative z-10 flex flex-col items-center gap-5'
>
 <motion.div
 animate={{ y: [0, -6, 0] }}
 transition={{ duration: 4, repeat: Infinity, ease:'easeInOut' }}
>
 <img src='/VoltCart.png' alt='VoltCart' className='w-24 h-24 object-contain drop-shadow-2xl' />
 </motion.div>
 <div className='text-center'>
 <p className='font-bold text-[32px] tracking-tight leading-none'
    style={{ color:'#3730a3' }}>
    Volt<span style={{ color:'#6366f1' }}>Cart</span>
    </p>
    <p className='text-[13px] mt-2 tracking-wide'
      style={{ color:'#6366f1' }}>
 Next-gen gadgets, delivered.
 </p>
 </div>
 </motion.div>
 </div>
 {/* ── end left panel ── */}

 {/* ════════════ RIGHT PANEL ════════════ */}
 <div className='flex-1 flex flex-col justify-center px-6 sm:px-10 py-8 sm:py-10 min-w-0'>
 <AnimatePresence mode='wait'>
 {!sent ? (
 <motion.div key='form' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

 {/* mobile logo */}
 <motion.div className='mb-7' {...fadeUp(0)}>
 <div className='flex items-center gap-2 mb-4 lg:hidden'>
 <div className='w-7 h-7 rounded-lg flex items-center justify-center shrink-0'
 style={{ background:'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
 <Zap size={14} className='text-white' strokeWidth={2.5} />
 </div>
 <span className='font-bold text-[15px]' style={{ color:'var(--tx)' }}>
 Volt<span style={{ color:'#6366f1' }}>Cart</span>
 </span>
 </div>
 <h1 className='text-[24px] font-bold tracking-tight' style={{ color:'var(--tx)' }}>
 Forgot password?
 </h1>
 <p className='text-[13px] mt-1' style={{ color:'var(--tx2)' }}>
 No worries — we&apos;ll send you a reset link
 </p>
 </motion.div>

 <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
 <motion.div {...fadeUp(1)}>
 <label className='block text-[12.5px] font-semibold mb-1.5 uppercase tracking-wide'
 style={{ color: focusedField ==='email' ?'#6366f1' :'var(--auth-label)' }}>
 Email address
 </label>
 <div className='relative'>
 <Mail size={15} className='absolute left-3.5 top-5.5 -translate-y-1/2 pointer-events-none'
 style={{ color:'var(--tx3)' }} />
 <input
 {...register('email')}
 type='email'
 placeholder='you@example.com'
 autoComplete='email'
 className={`${fieldCx} pl-10`}
 style={{ color:'var(--tx)', background:'var(--auth-input-bg)', border:'1px solid', ...focusStyle('email') }}
 onFocus={() => setFocusedField('email')}
 onBlur={() => setFocusedField(null)}
 />
 </div>
 {errors.email && (
 <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
 className='text-xs mt-1.5 text-red-500'>{errors.email.message}</motion.p>
 )}
 </motion.div>

 <motion.div {...fadeUp(2)} className='pt-1'>
 <button
 type='submit'
 disabled={loading}
 onClick={addRipple}
 className='relative w-full h-11 rounded-xl text-sm font-bold text-white overflow-hidden transition-all duration-200 disabled:opacity-50'
 style={{
 background:'linear-gradient(135deg, #6366f1, #4f46e5)',
 boxShadow:'0 4px 20px rgba(99,102,241,0.35)',
 }}
 onMouseEnter={e => {
 e.currentTarget.style.filter ='brightness(1.1)';
 e.currentTarget.style.boxShadow ='0 6px 28px rgba(99,102,241,0.5)';
 }}
 onMouseLeave={e => {
 e.currentTarget.style.filter ='';
 e.currentTarget.style.boxShadow ='0 4px 20px rgba(99,102,241,0.35)';
 }}
>
 {ripples.map(r => (
 <span key={r.id} className='absolute rounded-full pointer-events-none'
 style={{ left: r.x - 8, top: r.y - 8, width: 16, height: 16,
 background:'rgba(255,255,255,0.35)', transform:'scale(0)',
 animation:'ripple 0.6s ease-out forwards' }} />
 ))}
 <motion.span className='relative z-10 inline-flex items-center gap-1.5'
 animate={loading ? { opacity: [1, 0.6, 1] } : {}}
 transition={loading ? { duration: 1, repeat: Infinity } : {}}
>
 {loading ? (
 <>
 <span>Sending</span>
 <span className='flex gap-0.5'>
 {[0, 0.15, 0.3].map(d => (
 <motion.span key={d} animate={{ y: [0, -3, 0] }}
 transition={{ duration: 0.6, repeat: Infinity, delay: d }}
 className='w-1 h-1 rounded-full bg-white' />
 ))}
 </span>
 </>
 ) : (
 <span className='flex items-center gap-1.5'>
 Send Reset Link <ChevronRight size={15} strokeWidth={2.5} />
 </span>
 )}
 </motion.span>
 </button>
 </motion.div>
 </form>

 <motion.div {...fadeUp(3)} className='mt-6 pt-5' style={{ borderTop:'1px solid var(--auth-divider)' }}>
 <Link href='/auth/login'
 className='inline-flex items-center gap-1.5 text-[13px] font-medium transition-colors duration-200 hover:underline'
 style={{ color:'var(--tx2)' }}
>
 <ArrowLeft size={14} strokeWidth={2} /> Back to login
 </Link>
 </motion.div>

 <motion.div {...fadeUp(4)} className='mt-5 flex flex-wrap items-center justify-center gap-3 sm:gap-4'>
 {[
 { icon: Shield, label:'SSL Secured' },
 { icon: Star, label:'4.9 Rated' },
 { icon: Zap, label:'Instant Access' },
 ].map(({ icon: Icon, label }) => (
 <div key={label} className='flex items-center gap-1.5'>
 <Icon size={11} strokeWidth={2} style={{ color:'var(--tx3)' }} />
 <span className='text-[11px]' style={{ color:'var(--tx3)' }}>{label}</span>
 </div>
 ))}
 </motion.div>

 </motion.div>
 ) : (
 <motion.div
 key='success'
 initial={{ opacity: 0, scale: 0.96 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0 }}
 transition={{ duration: 0.4 }}
 className='text-center py-6'
>
 <motion.div
 initial={{ scale: 0, rotate: -20 }}
 animate={{ scale: 1, rotate: 0 }}
 transition={{ type:'spring', damping: 16, stiffness: 200 }}
 className='w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5'
 style={{ background:'var(--accent-dim)' }}
>
 <svg width='28' height='28' viewBox='0 0 24 24' fill='none' stroke='#22c55e' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
 <motion.polyline points='20 6 9 17 4 12'
 initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
 transition={{ duration: 0.5, delay: 0.2 }} />
 </svg>
 </motion.div>
 <h1 className='text-2xl font-bold mb-2' style={{ color:'var(--tx)' }}>Check your email</h1>
 <p className='text-sm mb-1' style={{ color:'var(--tx2)' }}>We sent a reset link to</p>
 <p className='font-semibold text-sm mb-5' style={{ color:'var(--tx)' }}>{emailValue}</p>
 <p className='text-xs leading-relaxed mb-8' style={{ color:'var(--tx2)' }}>
 Didn&apos;t receive it? Check your spam folder.
 </p>
 <div className='flex flex-col sm:flex-row items-center justify-center gap-3'>
 <button
 onClick={() => setSent(false)}
 className='text-[13px] font-semibold transition-colors duration-200 hover:underline'
 style={{ color:'#6366f1' }}
>
 Try a different email
 </button>
 <span className='hidden sm:block text-[var(--tx3)]'>·</span>
 <Link href='/auth/login'
 className='inline-flex items-center gap-1.5 text-[13px] font-medium transition-colors duration-200 hover:underline'
 style={{ color:'var(--tx2)' }}
>
 <ArrowLeft size={13} strokeWidth={2} /> Back to login
 </Link>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 {/* ── end right panel ── */}
 </motion.div>
 </div>
 </PageTransition>
 );
}
