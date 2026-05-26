'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/axios';

function ConfirmContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Missing confirmation token.');
      return;
    }
    api.get(`/subscribe/confirm?token=${encodeURIComponent(token)}`)
      .then(() => {
        setStatus('success');
        setMessage('Your email has been confirmed. You\'re now subscribed!');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err?.response?.data?.message || 'Confirmation failed. The link may be expired.');
      });
  }, [token]);

  return (
    <div className='min-h-svh flex items-center justify-center px-6' style={{ background: 'var(--bg)' }}>
      <div className='text-center max-w-md'>
        {status === 'loading' && (
          <div className='flex flex-col items-center gap-4'>
            <Loader2 size={40} strokeWidth={1.5} className='animate-spin' style={{ color: 'var(--accent)' }} />
            <p className='text-[15px]' style={{ color: 'var(--tx2)' }}>Confirming your subscription...</p>
          </div>
        )}

        {status === 'success' && (
          <div className='flex flex-col items-center gap-4'>
            <CheckCircle2 size={48} strokeWidth={1.5} className='text-[#22c55e]' />
            <h1 className='text-[24px] sm:text-[28px] font-bold' style={{ color: 'var(--tx)' }}>You&rsquo;re all set!</h1>
            <p className='text-[14px]' style={{ color: 'var(--tx2)' }}>{message}</p>
            <Link
              href='/'
              className='mt-4 inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[13px] font-semibold text-white transition-all duration-200 hover:-translate-y-0.5'
              style={{ background: 'var(--accent)' }}
            >
              Back to home
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className='flex flex-col items-center gap-4'>
            <XCircle size={48} strokeWidth={1.5} className='text-red-500' />
            <h1 className='text-[24px] sm:text-[28px] font-bold' style={{ color: 'var(--tx)' }}>Confirmation failed</h1>
            <p className='text-[14px]' style={{ color: 'var(--tx2)' }}>{message}</p>
            <Link
              href='/'
              className='mt-4 inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[13px] font-semibold text-white transition-all duration-200 hover:-translate-y-0.5'
              style={{ background: 'var(--accent)' }}
            >
              Back to home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={
      <div className='min-h-svh flex items-center justify-center px-6' style={{ background: 'var(--bg)' }}>
        <div className='flex flex-col items-center gap-4'>
          <Loader2 size={40} strokeWidth={1.5} className='animate-spin' style={{ color: 'var(--accent)' }} />
          <p className='text-[15px]' style={{ color: 'var(--tx2)' }}>Loading...</p>
        </div>
      </div>
    }>
      <ConfirmContent />
    </Suspense>
  );
}
