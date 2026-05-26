'use client';
import { useState, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import PageTransition from '@/components/layout/PageTransition';
import { useAuth } from '@/hooks/useAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterFormData } from '@/lib/validations/auth.schemas';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fadeUp = (i: number): any => ({
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1, y: 0,
    transition: { duration: 0.4, delay: 0.08 * i, ease: [0.16, 1, 0.3, 1] },
  },
});

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);
  const btnRef = useRef<HTMLButtonElement>(null);
  const rippleId = useRef(0);

  const {register, handleSubmit, formState: { errors }, watch} = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema)
  });

  const nameVal = watch('name');
  const emailVal = watch('email');
  const passVal = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    try {
      await registerUser(data.name, data.email, data.password);
      setSubmittedEmail(data.email);
      setRegistered(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const addRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = rippleId.current++;
    setRipples(prev => [...prev, { x, y, id }]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 600);
  };

  const focusStyle = (field: string) => ({
    borderColor: errors[field as keyof typeof errors]
      ? 'var(--auth-error)'
      : focusedField === field
        ? 'var(--auth-accent)'
        : 'var(--auth-input-border)',
    boxShadow: focusedField === field && !errors[field as keyof typeof errors]
      ? '0 0 0 3px rgba(99,102,241,0.1)'
      : 'none',
  } as React.CSSProperties);

  const labelColor = (field: string) =>
    focusedField === field ? 'var(--auth-accent)' : 'var(--auth-label)';

  const fieldCx =
    'w-full h-11 px-4 rounded-xl text-sm outline-none transition-all duration-200';

  return (
    <PageTransition>
      <div className='relative min-h-screen flex items-center justify-center px-5 py-12 overflow-hidden' style={{ background: 'var(--bg)' }}>
        {/* abstract floating rings */}
        <div aria-hidden className='pointer-events-none absolute inset-0 overflow-hidden'>
          <motion.div
            className='absolute -top-[8%] -right-[5%] w-[420px] h-[420px] rounded-full'
            style={{
              border: '1.5px solid rgba(99,102,241,0.2)',
              background: 'radial-gradient(circle at 30% 30%, rgba(99,102,241,0.06) 0%, transparent 60%)',
            }}
            animate={{ x: ['0%', '8%', '0%'], y: ['0%', '-6%', '0%'], rotate: [0, 5, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className='absolute -bottom-[10%] -left-[5%] w-[360px] h-[360px] rounded-full'
            style={{
              border: '1.5px solid rgba(168,85,247,0.18)',
              background: 'radial-gradient(circle at 70% 70%, rgba(168,85,247,0.05) 0%, transparent 60%)',
            }}
            animate={{ x: ['0%', '-6%', '0%'], y: ['0%', '8%', '0%'], rotate: [0, -4, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className='absolute top-[25%] left-[8%] w-[140px] h-[140px] rounded-full'
            style={{ border: '1.5px solid rgba(129,140,248,0.15)', background: 'rgba(129,140,248,0.04)' }}
            animate={{ x: ['0%', '12%', '0%'], y: ['0%', '8%', '0%'] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className='absolute bottom-[30%] right-[10%] w-[80px] h-[80px] rounded-full'
            style={{ border: '1.5px solid rgba(99,102,241,0.15)', background: 'rgba(99,102,241,0.04)' }}
            animate={{ x: ['0%', '-15%', '0%'], y: ['0%', '-10%', '0%'] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className='relative w-full max-w-[420px] rounded-2xl backdrop-blur-xl p-8 sm:p-10'
          style={{
            background: 'var(--card)',
            border: '1px solid var(--card-bdr)',
          }}
        >
          {registered ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className='text-center py-6'
            >
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 16, stiffness: 200 }}
                className='w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5'
                style={{ background: 'var(--accent-dim)' }}
              >
                <svg width='28' height='28' viewBox='0 0 24 24' fill='none' stroke='var(--auth-success-icon)' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
                  <motion.polyline
                    points='20 6 9 17 4 12'
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  />
                </svg>
              </motion.div>
              <motion.h1 className='text-2xl font-bold mb-2' style={{ color: 'var(--tx)' }}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                Check your email
              </motion.h1>
              <motion.p className='text-sm mb-1' style={{ color: 'var(--tx2)' }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.22 }}>
                We sent a verification link to
              </motion.p>
              <motion.p className='font-semibold text-sm mb-5' style={{ color: 'var(--tx)' }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.28 }}>
                {submittedEmail}
              </motion.p>
              <motion.p className='text-xs leading-relaxed mb-8' style={{ color: 'var(--tx2)' }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.34 }}>
                Click the link to activate your account.<br />
                Didn&apos;t receive it? Check your spam folder.
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <Link
                  href='/auth/login'
                  className='inline-flex items-center justify-center font-semibold text-sm rounded-xl h-10 px-6 transition-all duration-200'
                  style={{
                    color: '#fff',
                    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                  }}
                >
                  Back to login
                </Link>
              </motion.div>
            </motion.div>
          ) : (
            <>
              <motion.div
                className='mb-8 text-center'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
  
                <h1 className='text-[26px] font-bold tracking-tight leading-tight' style={{ color: 'var(--tx)' }}>
                  Create your account
                </h1>
                <p className='text-sm mt-1.5' style={{ color: 'var(--tx2)' }}>
                  Join thousands of tech enthusiasts
                </p>
              </motion.div>

              <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                <motion.div variants={fadeUp(0)} initial='initial' animate='animate'>
                  <motion.label
                    className='block text-sm font-medium mb-1.5'
                    animate={{ color: labelColor('name') }}
                    transition={{ duration: 0.2 }}
                  >
                    Full name
                  </motion.label>
                  <input
                    {...register('name')}
                    type='text'
                    placeholder='John Doe'
                    autoComplete='name'
                    className={fieldCx}
                    style={{
                      color: 'var(--tx)',
                      background: 'var(--auth-input-bg)',
                      border: '1px solid',
                      ...focusStyle('name'),
                    }}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                  />
                  {errors.name && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className='text-xs mt-1.5' style={{ color: 'var(--auth-error)' }}>
                      {errors.name.message}
                    </motion.p>
                  )}
                </motion.div>

                <motion.div variants={fadeUp(1)} initial='initial' animate='animate'>
                  <motion.label
                    className='block text-sm font-medium mb-1.5'
                    animate={{ color: labelColor('email') }}
                    transition={{ duration: 0.2 }}
                  >
                    Email address
                  </motion.label>
                  <input
                    {...register('email')}
                    type='email'
                    placeholder='you@example.com'
                    autoComplete='email'
                    className={fieldCx}
                    style={{
                      color: 'var(--tx)',
                      background: 'var(--auth-input-bg)',
                      border: '1px solid',
                      ...focusStyle('email'),
                    }}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                  />
                  {errors.email && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className='text-xs mt-1.5' style={{ color: 'var(--auth-error)' }}>
                      {errors.email.message}
                    </motion.p>
                  )}
                </motion.div>

                <motion.div variants={fadeUp(2)} initial='initial' animate='animate'>
                  <motion.label
                    className='block text-sm font-medium mb-1.5'
                    animate={{ color: labelColor('password') }}
                    transition={{ duration: 0.2 }}
                  >
                    Password
                  </motion.label>
                  <div className='relative'>
                    <input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder='Min. 8 characters'
                      autoComplete='new-password'
                      className={fieldCx}
                      style={{
                        color: 'var(--tx)',
                        background: 'var(--auth-input-bg)',
                        border: '1px solid',
                        paddingRight: '44px',
                        ...focusStyle('password'),
                      }}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                    />
                    <motion.button
                      type='button'
                      onClick={() => setShowPassword(!showPassword)}
                      className='absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200'
                      style={{ color: 'var(--tx2)' }}
                      whileHover={{ scale: 1.1, color: 'var(--auth-accent)' }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </motion.button>
                  </div>
                  {errors.password && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className='text-xs mt-1.5' style={{ color: 'var(--auth-error)' }}>
                      {errors.password.message}
                    </motion.p>
                  )}
                </motion.div>

                <motion.div variants={fadeUp(3)} initial='initial' animate='animate'>
                  <button
                    ref={btnRef}
                    type='submit'
                    disabled={loading}
                    className='relative w-full h-11 rounded-xl text-sm font-bold transition-all duration-200 disabled:opacity-40 overflow-hidden'
                    style={{
                      color: '#fff',
                      background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                      boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.filter = 'brightness(1.08)';
                      e.currentTarget.style.boxShadow = '0 6px 28px rgba(99,102,241,0.45)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.filter = 'brightness(1)';
                      e.currentTarget.style.boxShadow = '0 4px 20px rgba(99,102,241,0.3)';
                    }}
                    onClick={addRipple}
                  >
                    {ripples.map(r => (
                      <span
                        key={r.id}
                        className='absolute rounded-full pointer-events-none'
                        style={{
                          left: r.x - 8,
                          top: r.y - 8,
                          width: 16,
                          height: 16,
                          background: 'rgba(255,255,255,0.35)',
                          transform: 'scale(0)',
                          animation: 'ripple 0.6s ease-out forwards',
                        }}
                      />
                    ))}
                    <motion.span
                      className='relative z-10 inline-flex items-center gap-2'
                      animate={loading ? { opacity: [1, 0.6, 1] } : {}}
                      transition={loading ? { duration: 1, repeat: Infinity } : {}}
                    >
                      {loading ? (
                        <>
                          <span>Creating account</span>
                          <span className='flex gap-0.5'>
                            <motion.span animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} className='w-1 h-1 rounded-full bg-white' />
                            <motion.span animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }} className='w-1 h-1 rounded-full bg-white' />
                            <motion.span animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }} className='w-1 h-1 rounded-full bg-white' />
                          </span>
                        </>
                      ) : (
                        'Create account'
                      )}
                    </motion.span>
                  </button>
                </motion.div>
              </form>

              <motion.div
                className='mt-8 pt-6 text-center'
                style={{ borderTop: '1px solid var(--auth-divider)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
              >
                <p className='text-sm' style={{ color: 'var(--tx2)' }}>
                  Already have an account?{' '}
                  <Link href='/auth/login' className='font-semibold transition-colors duration-200 hover:underline'
                    style={{ color: 'var(--auth-accent)' }}>
                    Sign in
                  </Link>
                </p>
              </motion.div>
            </>
          )}
        </motion.div>
      </div>
    </PageTransition>
  );
}
