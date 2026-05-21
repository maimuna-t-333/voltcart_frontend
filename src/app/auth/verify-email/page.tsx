'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import api from '@/lib/axios';
import PageTransition from '@/components/layout/PageTransition';

type Status = 'loading' | 'success' | 'error';

export default function VerifyEmailPage() {
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
      <div className='min-h-screen bg-linear-to-br from-brand-50 to-white flex items-center justify-center px-4'>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className='bg-white rounded-3xl shadow-xl p-10 w-full max-w-md text-center'
        >
          {status === 'loading' && (
            <>
              <Loader size={48} className='text-brand-500 animate-spin mx-auto mb-4' />
              <h2 className='text-xl font-bold text-gray-900'>Verifying your email…</h2>
            </>
          )}

          {status === 'success' && (
            <>
              <div className='w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6'>
                <CheckCircle size={40} className='text-green-500' />
              </div>
              <h2 className='text-2xl font-bold text-gray-900 mb-2'>Email Verified!</h2>
              <p className='text-gray-500 text-sm mb-6'>{message}</p>
              <Link
                href='/auth/login'
                className='inline-block bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 px-8 rounded-xl transition-colors'
              >
                Go to Login
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className='w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6'>
                <XCircle size={40} className='text-red-500' />
              </div>
              <h2 className='text-2xl font-bold text-gray-900 mb-2'>Verification Failed</h2>
              <p className='text-gray-500 text-sm mb-6'>{message}</p>
              <Link
                href='/auth/register'
                className='text-brand-500 text-sm font-medium hover:underline'
              >
                Back to Register
              </Link>
            </>
          )}
        </motion.div>
      </div>
    </PageTransition>
  );
}