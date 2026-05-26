'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader, Zap } from 'lucide-react';
import api from '@/lib/axios';
import PageTransition from '@/components/layout/PageTransition';

type Status = 'loading' | 'success' | 'error';

export default function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const [status, setStatus]   = useState<Status>('loading');
  const [message, setMessage] = useState('');

useEffect(() => {
  const verifyEmail = async () => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('No verification token found in the URL.');
      return;
    }

    try {
      await api.get(`/auth/verify-email?token=${token}`);
      setStatus('success');
      setMessage('Your email has been verified! You can now log in.');
    } catch (err: any) {
      setStatus('error');
      setMessage(
        err.response?.data?.message ||
        'Invalid or expired link. Please register again.'
      );
    }
  };

  verifyEmail();
}, [searchParams]);

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
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className='text-lg font-medium auth-tagline'>
              {status === 'loading' ? 'Hang tight...' : status === 'success' ? 'All done!' : 'Something went wrong'}
            </motion.p>
          </div>
        </div>

        {/* Content Panel */}
        <div className='flex-1 flex items-center justify-center px-5 py-12 auth-form-panel'>
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className='w-full max-w-sm text-center'>
            <div className='flex items-center gap-2 mb-10 lg:hidden'>
              <div className='flex items-center justify-center w-10 h-10 rounded-xl auth-brand-logo'>
                <Zap size={18} className='text-white' />
              </div>
              <span className='text-lg font-bold auth-brand-name'>VoltCart</span>
            </div>

            {status === 'loading' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='py-8'>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  className='flex items-center justify-center mx-auto mb-6'>
                  <Loader size={44} strokeWidth={2} style={{ color: 'var(--auth-accent)' }} />
                </motion.div>
                <h2 className='text-2xl font-bold auth-heading mb-2'>Verifying your email...</h2>
              </motion.div>
            )}

            {status === 'success' && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className='py-8'>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 15 }}
                  className='w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 auth-success-icon'>
                  <CheckCircle size={40} style={{ color: '#22c55e' }} />
                </motion.div>
                <h2 className='text-2xl font-bold auth-heading mb-2'>Email Verified!</h2>
                <p className='text-sm auth-sub mb-8'>{message}</p>
                <Link href='/auth/login' className='auth-btn inline-flex items-center gap-2 font-bold py-3 px-8 rounded-xl text-sm'>
                  Go to Login
                </Link>
              </motion.div>
            )}

            {status === 'error' && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className='py-8'>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 15 }}
                  className='w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 auth-error-icon'>
                  <XCircle size={40} style={{ color: '#ef4444' }} />
                </motion.div>
                <h2 className='text-2xl font-bold auth-heading mb-2'>Verification Failed</h2>
                <p className='text-sm auth-sub mb-8'>{message}</p>
                <Link href='/auth/register' className='text-sm font-semibold auth-link'>
                  Back to Register
                </Link>
              </motion.div>
            )}
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
        .auth-form-panel { background: var(--auth-form-bg); }
        .auth-heading { color: var(--auth-text); }
        .auth-sub { color: var(--auth-muted); }
        .auth-link { color: var(--auth-accent); }
        .auth-link:hover { color: var(--auth-accent-hover); text-decoration: underline; }
        .auth-success-icon { background: rgba(34,197,94,0.12); }
        .auth-error-icon { background: rgba(239,68,68,0.12); }
        .auth-btn {
          color: #fff;
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          box-shadow: 0 4px 16px rgba(99,102,241,0.3);
        }
        .auth-btn:hover { filter: brightness(1.08); box-shadow: 0 6px 24px rgba(99,102,241,0.4); }

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
        }
      `}</style>
    </PageTransition>
  );
}
