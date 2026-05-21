'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, ShoppingBag, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import PageTransition from '@/components/layout/PageTransition';
import { useAuth } from '@/hooks/useAuth';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (password.length < 8) {
    toast.error('Password must be at least 8 characters');
    return;
  }
  setLoading(true);
  try {
    await register(name, email, password);
    setRegistered(true);
  } catch (err: any) {
    toast.error(err.response?.data?.message || 'Registration failed');
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
          {registered ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className='text-center'
            >
              <div className='w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6'>
                <CheckCircle size={40} className='text-green-500' />
              </div>
              <h2 className='text-2xl font-bold text-gray-900 mb-2'>Check your email!</h2>
              <p className='text-gray-500 text-sm mb-2'>
                We sent a verification link to
              </p>
              <p className='font-semibold text-gray-900 mb-6'>{email}</p>
              <p className='text-xs text-gray-400 mb-6'>
                Click the link in the email to activate your account.<br />
                Didn't receive it? Check your spam folder.
              </p>
              <Link
                href='/auth/login'
                className='text-brand-500 text-sm font-medium hover:underline'
              >
                Back to Login
              </Link>
            </motion.div>
          ) : (
            <>
              <div className='text-center mb-8'>
                <div className='w-14 h-14 bg-brand-500 rounded-2xl flex items-center justify-center mx-auto mb-4'>
                  <ShoppingBag size={28} className='text-white' />
                </div>
                <h1 className='text-2xl font-bold text-gray-900'>Create account</h1>
                <p className='text-gray-500 mt-1'>Join VoltCart today</p>
              </div>
 
              <form onSubmit={handleSubmit} className='space-y-5'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>Full Name</label>
                  <div className='relative'>
                    <User size={18} className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400' />
                    <input
                      type='text'
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder='John Doe'
                      required
                      className='w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm'
                    />
                  </div>
                </div>
 
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
 
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>Password</label>
                  <div className='relative'>
                    <Lock size={18} className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400' />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder='Min. 8 characters'
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
 
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type='submit'
                  disabled={loading}
                  className='w-full bg-brand-500 hover:bg-brand-600 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl transition-colors'
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </motion.button>
              </form>
 
              <p className='text-center text-sm text-gray-500 mt-6'>
                Already have an account?{' '}
                <Link href='/auth/login' className='text-brand-500 font-semibold hover:underline'>
                  Sign in
                </Link>
              </p>
            </>
          )}
        </motion.div>
      </div>
    </PageTransition>
  );
}
