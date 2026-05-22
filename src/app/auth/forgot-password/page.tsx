'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle, ShoppingBag } from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import PageTransition from '@/components/layout/PageTransition';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/validations/auth.schemas';

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const {register, handleSubmit, watch, formState: { errors }} = useForm<ForgotPasswordFormData>({
  resolver: zodResolver(forgotPasswordSchema)});

  const emailValue = watch('email');

  const onSubmit = async (data: ForgotPasswordFormData) => {
  setLoading(true);
  try {
    await api.post('/auth/forgot-password', { email: data.email });
    setSent(true);
    toast.success('Reset email sent!');
  } catch (err: any) {
    toast.error(err.response?.data?.message || 'Something went wrong');
  } finally {
    setLoading(false);
  }
};

  return (
    <PageTransition>
      <div className='min-h-screen bg-linear-to-br from-brand-50 to-white flex items-center justify-center px-4 py-12'>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className='bg-white rounded-3xl shadow-xl p-8 w-full max-w-md'
        >
          {!sent ? (
            <>
              <div className='text-center mb-8'>
                <div className='w-14 h-14 bg-brand-500 rounded-2xl flex items-center justify-center mx-auto mb-4'>
                  <ShoppingBag size={28} className='text-white' />
                </div>
                <h1 className='text-2xl font-bold text-gray-900'>Forgot Password?</h1>
                <p className='text-gray-500 mt-2 text-sm'>
                  Enter your email and we will send you a reset link
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>Email</label>
                  <div className='relative'>
                    <Mail size={18} className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400' />
                    <input
                      {...register('email')}
                      type='email'
                      placeholder='you@example.com'
                      className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm
                        ${errors.email ? 'border-red-400' : 'border-gray-200'}`}
                    />
                    {errors.email && (
                      <p className='text-red-500 text-xs mt-1'>{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type='submit'
                  disabled={loading}
                  className='w-full bg-brand-500 hover:bg-brand-600 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl transition-colors'
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </motion.button>
              </form>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className='text-center'
            >
              <div className='w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6'>
                <CheckCircle size={40} className='text-green-500' />
              </div>
              <h2 className='text-2xl font-bold text-gray-900 mb-2'>Check your email!</h2>
              <p className='text-gray-500 text-sm mb-6'>
                We sent a password reset link to<br />
                <span className='font-semibold text-gray-900'>{emailValue}</span>
              </p>
              <p className='text-xs text-gray-400 mb-6'>
                Didn't receive it? Check your spam folder or try again.
              </p>
              <button
                onClick={() => setSent(false)}
                className='text-brand-500 text-sm font-medium hover:underline'
              >
                Try a different email
              </button>
            </motion.div>
          )}

          <div className='mt-6 text-center'>
            <Link
              href='/auth/login'
              className='flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-brand-500 transition-colors'
            >
              <ArrowLeft size={16} />
              Back to Login
            </Link>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
