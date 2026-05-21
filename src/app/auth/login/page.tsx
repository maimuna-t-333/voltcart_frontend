'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import PageTransition from '@/components/layout/PageTransition';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  try {
    await login(email, password);
    router.push('/');
  } catch (err: any) {
    toast.error(err.response?.data?.message || 'Login failed');
  } finally {
    setLoading(false);
  }
};

  return (
    <PageTransition>
      <div className='min-h-screen bg-gradient-to-br from-brand-50 to-white flex items-center justify-center px-4 py-12'>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className='bg-white rounded-3xl shadow-xl p-8 w-full max-w-md'
        >
          {/* Logo */}
          <div className='text-center mb-8'>
            <div className='w-14 h-14 bg-brand-500 rounded-2xl flex items-center justify-center mx-auto mb-4'>
              <ShoppingBag size={28} className='text-white' />
            </div>
            <h1 className='text-2xl font-bold text-gray-900'>Welcome back</h1>
            <p className='text-gray-500 mt-1'>Sign in to your VoltCart account</p>
          </div>

          <form onSubmit={handleSubmit} className='space-y-5'>
            {/* Email */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Email</label>
              <div className='relative'>
                <Mail size={18} className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400' />
                <input
                  type='email'
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder='you@example.com'
                  required
                  className='w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm'
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className='flex justify-between mb-2'>
                <label className='block text-sm font-medium text-gray-700'>Password</label>
                <Link href='/auth/forgot-password' className='text-xs text-brand-500 hover:underline'>
                  Forgot password?
                </Link>
              </div>
              <div className='relative'>
                <Lock size={18} className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400' />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder='••••••••'
                  required
                  className='w-full pl-11 pr-11 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm'
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type='submit'
              disabled={loading}
              className='w-full bg-brand-500 hover:bg-brand-600 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl transition-colors'
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </motion.button>
          </form>

          <p className='text-center text-sm text-gray-500 mt-6'>
            Don't have an account?{' '}
            <Link href='/auth/register' className='text-brand-500 font-semibold hover:underline'>
              Create one
            </Link>
          </p>
        </motion.div>
      </div>
    </PageTransition>
  );
}
