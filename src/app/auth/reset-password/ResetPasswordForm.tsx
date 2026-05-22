'use client';
import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, ShoppingBag } from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import PageTransition from '@/components/layout/PageTransition';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema, type ResetPasswordFormData } from '@/lib/validations/auth.schemas';

export default function ResetPasswordForm() {
  const searchParams                    = useSearchParams();
  const router                          = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);

  const {register, handleSubmit, formState: { errors }} = useForm<ResetPasswordFormData>({
  resolver: zodResolver(resetPasswordSchema)});

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
      <div className='min-h-screen bg-linear-to-br from-brand-50 to-white flex items-center justify-center px-4 py-12'>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className='bg-white rounded-3xl shadow-xl p-8 w-full max-w-md'
        >
          <div className='text-center mb-8'>
            <div className='w-14 h-14 bg-brand-500 rounded-2xl flex items-center justify-center mx-auto mb-4'>
              <ShoppingBag size={28} className='text-white' />
            </div>
            <h1 className='text-2xl font-bold text-gray-900'>Set New Password</h1>
            <p className='text-gray-500 mt-2 text-sm'>Must be at least 8 characters</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>New Password</label>
              <div className='relative'>
                <Lock size={18} className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400' />
                <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder='Min. 8 characters'
                    className={`w-full pl-11 pr-11 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm
                        ${errors.password ? 'border-red-400' : 'border-gray-200'}`}
                    />
                    {errors.password && (
                    <p className='text-red-500 text-xs mt-1'>{errors.password.message}</p>
                    )}
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Confirm Password</label>
              <div className='relative'>
                <Lock size={18} className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400' />
                <input
                    {...register('confirm')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder='Repeat your password'
                    className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm
                        ${errors.confirm ? 'border-red-400' : 'border-gray-200'}`}
                    />
                    {errors.confirm && (
                    <p className='text-red-500 text-xs mt-1'>{errors.confirm.message}</p>
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
              {loading ? 'Resetting...' : 'Reset Password'}
            </motion.button>
          </form>

          <div className='mt-6 text-center'>
            <Link href='/auth/login' className='text-sm text-gray-500 hover:text-brand-500 transition-colors'>
              Back to Login
            </Link>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}