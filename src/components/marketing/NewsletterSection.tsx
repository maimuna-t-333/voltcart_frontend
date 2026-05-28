'use client';
import { useState, FormEvent, useCallback } from'react';
import { motion, AnimatePresence } from'framer-motion';
import { Send, CheckCircle2, Loader2 } from'lucide-react';
import api from'@/lib/axios';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function NewsletterSection() {
 const [name, setName] = useState('');
 const [email, setEmail] = useState('');
 const [loading, setLoading] = useState(false);
 const [done, setDone] = useState(false);
 const [error, setError] = useState('');

 const handleSubmit = useCallback(async (e: FormEvent) => {
 e.preventDefault();
 setError('');

 const trimmed = email.trim();
 if (!trimmed) { setError('Please enter your email address.'); return; }
 if (!EMAIL_RE.test(trimmed)) { setError('That doesn\u2019t look like a valid email.'); return; }

 setLoading(true);
 try {
 await api.post('/subscribe', { email: trimmed, name: name.trim() || undefined });
 setDone(true);
 } catch (err: any) {
 const msg = err?.response?.data?.message || err?.message;
 if (msg?.toLowerCase?.().includes('already')) {
 setError('This email is already subscribed.');
 } else {
 setError(msg ||'Something went wrong. Please try again.');
 }
 } finally {
 setLoading(false);
 }
 }, [email, name]);

 const handleReset = useCallback(() => {
 setDone(false);
 setEmail('');
 setName('');
 setError('');
 }, []);

 return (
 <section className='relative overflow-hidden transition-colors duration-400'
 style={{ background:'var(--nl-bg)' }}
>
 {/* top glow */}
 <div aria-hidden className='pointer-events-none absolute inset-0 z-0'>
 <div className='absolute top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full blur-[150px]'
 style={{ background:'var(--nl-orb-1)' }}
 />
 <div className='absolute bottom-[-150px] right-[-100px] w-[500px] h-[500px] rounded-full blur-[120px]'
 style={{ background:'var(--nl-orb-2)' }}
 />
 <div className='absolute top-1/3 left-[-80px] w-[300px] h-[300px] rounded-full blur-[100px]'
 style={{ background:'var(--nl-orb-3)' }}
 />
 </div>

 {/* decorative dots pattern */}
 <div aria-hidden className='pointer-events-none absolute inset-0 z-0 opacity-[0.03]'
 style={{
 backgroundImage:'radial-gradient(circle, currentColor 0.5px, transparent 0.5px)',
 backgroundSize:'32px 32px',
 color:'var(--nl-text)',
 }}
 />

 {/* top divider line */}
 <div className='absolute inset-x-0 top-0 h-px z-10'
 style={{ background:'linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent)' }}
 />

 <div className='relative z-10 mx-auto max-w-300 px-7 py-20 sm:py-28'>
 <div className='max-w-180 mx-auto'>
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true }}
 transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
 className='text-center mb-10 sm:mb-12'
>
 <span className='inline-block text-[11px] font-semibold tracking-[0.25em] uppercase px-4 py-1.5 rounded-full mb-5'
 style={{
 color:'var(--accent)',
 background:'var(--accent-dim)',
 border:'1px solid var(--accent-glow)',
 }}
>
 Never miss a beat
 </span>
 <h2 className='text-[32px] sm:text-[40px] lg:text-[46px] font-bold leading-[1.1] tracking-[-0.03em]' style={{ color:'var(--nl-text)' }}>
 Stay ahead of&nbsp;the&nbsp;curve
 </h2>
 <p className='text-[15px] sm:text-[16px] mt-4 max-w-lg mx-auto leading-relaxed' style={{ color:'var(--nl-muted)' }}>
 Be the first to know about drops, deals, and exclusive launches — delivered to your inbox, not your spam folder.
 </p>
 </motion.div>

 {/* glass card */}
 <motion.div
 initial={{ opacity: 0, y: 24, scale: 0.98 }}
 whileInView={{ opacity: 1, y: 0, scale: 1 }}
 viewport={{ once: true }}
 transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
 className='relative rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10'
 style={{
 background:'var(--nl-glass)',
 backdropFilter:'blur(24px)',
 WebkitBackdropFilter:'blur(24px)',
 border:'1px solid var(--nl-glass-border)',
 boxShadow:'0 24px 80px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
 }}
>
 {/* inner card glow */}
 <div aria-hidden className='pointer-events-none absolute inset-0 rounded-2xl sm:rounded-3xl opacity-50'
 style={{
 background:'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.08) 0%, transparent 70%)',
 }}
 />

 {done ? (
 <motion.div
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
 className='relative flex flex-col items-center gap-4 py-8'
>
 <div className='size-16 rounded-2xl flex items-center justify-center' style={{ background:'rgba(34,197,94,0.12)' }}>
 <CheckCircle2 size={40} strokeWidth={1.5} className='text-[#22c55e]' />
 </div>
 <h3 className='text-[22px] sm:text-[26px] font-bold' style={{ color:'var(--nl-text)' }}>You&rsquo;re on the list!</h3>
 <p className='text-[14px] text-center max-w-sm' style={{ color:'var(--nl-muted)' }}>
 We sent a confirmation to <strong style={{ color:'var(--nl-text)' }}>{email}</strong>.
 Click the link inside to complete your subscription.
 </p>
 <button
 onClick={handleReset}
 className='mt-2 text-[12px] font-medium underline underline-offset-2 transition-opacity duration-200 hover:opacity-70'
 style={{ color:'var(--nl-muted)' }}
>
 Subscribe with a different email
 </button>
 </motion.div>
 ) : (
 <div className='relative'>
 <form onSubmit={handleSubmit} noValidate>
 <div className='grid grid-cols-1 sm:grid-cols-6 gap-3 sm:gap-4'>
 <div className='sm:col-span-2'>
 <label htmlFor='nl-name-2' className='sr-only'>Your name</label>
 <input
 id='nl-name-2'
 type='text'
 placeholder='Your name'
 autoComplete='name'
 value={name}
 onChange={(e) => setName(e.target.value)}
 className='w-full px-4 py-3.5 sm:py-4 rounded-xl text-[14px] outline-none transition-all duration-200 focus:ring-2 placeholder:text-neutral-400'
 style={{
 background:'var(--nl-input-bg)',
 border:'1px solid var(--nl-input-border)',
 color:'var(--nl-text)',
'--tw-ring-color':'#818cf8',
 } as React.CSSProperties}
 />
 </div>
 <div className='sm:col-span-2'>
 <label htmlFor='nl-email-2' className='sr-only'>Email address</label>
 <input
 id='nl-email-2'
 type='email'
 required
 placeholder='Enter your email'
 autoComplete='email'
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 className='w-full px-4 py-3.5 sm:py-4 rounded-xl text-[14px] outline-none transition-all duration-200 focus:ring-2 placeholder:text-neutral-400'
 style={{
 background:'var(--nl-input-bg)',
 border:'1px solid var(--nl-input-border)',
 color:'var(--nl-text)',
'--tw-ring-color':'#818cf8',
 } as React.CSSProperties}
 />
 </div>
 <div className='sm:col-span-2'>
 <button
 type='submit'
 disabled={loading}
 className='w-full flex items-center justify-center gap-2.5 px-6 py-3.5 sm:py-4 rounded-xl text-[14px] font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none'
 style={{
 background:'var(--nl-btn-bg)',
 color:'var(--nl-btn-text)',
 boxShadow: loading ?'none' :'var(--nl-btn-shadow)',
 }}
>
 {loading ? (
 <Loader2 size={16} strokeWidth={2} className='animate-spin' />
 ) : (
 <Send size={15} strokeWidth={2} />
 )}
 {loading ?'Subscribing...' :'Subscribe'}
 </button>
 </div>
 </div>

 <AnimatePresence>
 {error && (
 <motion.p
 key='error-2'
 initial={{ opacity: 0, y: -4 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -4 }}
 transition={{ duration: 0.2 }}
 className='text-[12.5px] mt-3 text-left'
 style={{ color:'#fca5a5' }}
 role='alert'
>
 {error}
 </motion.p>
 )}
 </AnimatePresence>
 </form>

 {/* trust row */}
 <div className='flex items-center justify-center gap-4 sm:gap-6 mt-6 text-[11.5px]' style={{ color:'var(--nl-trust)' }}>
 <span>No spam</span>
 <span className='w-1 h-1 rounded-full' style={{ background:'var(--nl-trust)' }} />
 <span>Unsubscribe anytime</span>
 <span className='w-1 h-1 rounded-full' style={{ background:'var(--nl-trust)' }} />
 <span>Double opt-in</span>
 </div>
 </div>
 )}
 </motion.div>
 </div>
 </div>
 </section>
 );
}
