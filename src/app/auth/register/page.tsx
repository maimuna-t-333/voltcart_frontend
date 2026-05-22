'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, ShoppingBag, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import PageTransition from '@/components/layout/PageTransition';
import { useAuth } from '@/hooks/useAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterFormData } from '@/lib/validations/auth.schemas';

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered]   = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const {register, handleSubmit,formState: { errors }} = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema)
  });

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

  return (
    <PageTransition>
      <div className='min-h-screen bg-linear-to-br from-brand-50 to-white flex items-center justify-center px-4 py-12'>
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
              <p className='font-semibold text-gray-900 mb-6'>{submittedEmail}</p>
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
 
              <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>Full Name</label>
                  <div className='relative'>
                    <User size={18} className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400' />
                    <input
                      {...register('name')}
                      type='text'
                      placeholder='John Doe'
                      className={`w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm ${errors.name ? 'border-red-400' : 'border-gray-200'}`}
                    />
                  </div>
                  {errors.name && (
                    <p className='text-red-500 text-xs mt-1'>{errors.name.message}</p>
                  )}
                </div>
 
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>Email</label>
                  <div className='relative'>
                    <Mail size={18} className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400' />
                    <input
                      {...register('email')}
                      type='email'
                      placeholder='you@example.com'
                      className={`w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm ${errors.email ? 'border-red-400' : 'border-gray-200'}`}
                    />
                  </div>
                  {errors.email && (
                    <p className='text-red-500 text-xs mt-1'>{errors.email.message}</p>
                  )}
                </div>
 
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>Password</label>
                  <div className='relative'>
                    <Lock size={18} className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400' />
                    <input
                     {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder='Min. 8 characters'
                      className={`w-full pl-11 pr-11 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm
                        ${errors.password ? 'border-red-400' : 'border-gray-200'}`}
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
