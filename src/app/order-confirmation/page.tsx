'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { CheckCircle, ShoppingBag, Home } from 'lucide-react';
import PageTransition from '@/components/layout/PageTransition';

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div className='max-w-lg mx-auto px-4 py-20 text-center'>
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <div className='w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6'>
          <CheckCircle size={52} className='text-green-500' />
        </div>
        <h1 className='text-3xl font-bold text-gray-900 mb-3'>Order Confirmed!</h1>
        <p className='text-gray-500 mb-2'>Thank you for your purchase 🎉</p>
        {orderId && (
          <p className='text-sm text-gray-400 mb-8'>
            Order ID: <span className='font-mono font-medium text-gray-600'>{orderId}</span>
          </p>
        )}
        <div className='bg-gray-50 rounded-2xl p-6 mb-8 text-left'>
          <h3 className='font-bold text-gray-900 mb-3'>What's next?</h3>
          <ul className='space-y-2 text-sm text-gray-600'>
            <li className='flex items-center gap-2'>✅ Order confirmation email sent</li>
            <li className='flex items-center gap-2'>📦 Your order is being processed</li>
            <li className='flex items-center gap-2'>🚚 Shipping updates via email</li>
            <li className='flex items-center gap-2'>⭐ Rate your products after delivery</li>
          </ul>
        </div>
        <div className='flex gap-3'>
          <Link href='/'
            className='flex-1 flex items-center justify-center gap-2 border border-gray-200 text-gray-600 font-medium py-3 rounded-2xl hover:bg-gray-50 transition-colors'>
            <Home size={18} />
            Home
          </Link>
          <Link href='/products'
            className='flex-1 flex items-center justify-center gap-2 bg-brand-500 text-white font-bold py-3 rounded-2xl hover:bg-brand-600 transition-colors'>
            <ShoppingBag size={18} />
            Shop More
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <PageTransition>
      <Suspense fallback={<div className='p-8 text-center'>Loading...</div>}>
        <OrderConfirmationContent />
      </Suspense>
    </PageTransition>
  );
}
