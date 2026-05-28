'use client';
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ShoppingBag, Copy, Check, MailCheck, Package, Truck, Home, Lightbulb, ArrowRight, ArrowLeft } from 'lucide-react';
import PageTransition from '@/components/layout/PageTransition';

function AnimatedCheck() {
  return (
    <svg width={72} height={72} viewBox='0 0 72 72' fill='none'>
      <motion.circle
        cx={36} cy={36} r={32}
        stroke='currentColor'
        strokeWidth={3}
        strokeLinecap='round'
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        style={{ color: '#22c55e' }}
      />
      <motion.path
        d='M22 37l10 10 18-20'
        stroke='currentColor'
        strokeWidth={3.5}
        strokeLinecap='round'
        strokeLinejoin='round'
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: 0.3, ease: 'easeInOut' }}
        style={{ color: '#22c55e' }}
      />
    </svg>
  );
}

const orderSteps = [
  { icon: MailCheck, label: 'Confirmed', time: 'Just now' },
  { icon: Package, label: 'Processing', time: '1-2 hrs' },
  { icon: Truck, label: 'Shipped', time: '1-2 days' },
  { icon: Home, label: 'Delivered', time: '3-5 days' },
];

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [copied, setCopied] = useState(false);

  const copyOrderId = () => {
    if (!orderId) return;
    navigator.clipboard.writeText(orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className='relative min-h-screen overflow-hidden' style={{ background: 'var(--bg)' }}>
      {/* Diagonal accent */}
      <div className='fixed top-0 right-0 w-[600px] h-[600px] pointer-events-none'
        style={{
          background: 'linear-gradient(225deg, var(--accent-dim) 0%, transparent 60%)',
          clipPath: 'polygon(100% 0, 0 0, 100% 100%)',
        }}
      />

      {/* Bottom-right geometric */}
      <div className='fixed bottom-0 left-0 w-[400px] h-[400px] pointer-events-none opacity-40'
        style={{
          background: 'radial-gradient(ellipse at 30% 70%, rgba(34,197,94,0.08) 0%, transparent 60%)',
        }}
      />

      {/* Dots pattern */}
      <div className='fixed inset-0 pointer-events-none opacity-[0.03]'
        style={{
          backgroundImage: 'radial-gradient(circle, var(--tx) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className='relative z-10 max-w-lg mx-auto px-4 py-16'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 22 }}
        >
          {/* Checkmark */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 250, damping: 12, delay: 0.1 }}
            className='flex justify-center mb-6'
            style={{ color: '#22c55e' }}
          >
            <AnimatedCheck />
          </motion.div>

          {/* Headline */}
          <div className='text-center mb-8'>
            <h1 className='text-[2.5rem] leading-tight font-extrabold tracking-tight mb-1'
              style={{ color: 'var(--tx)', fontFamily: 'var(--font-family-display)' }}>
              You&apos;re all set!
            </h1>
            <p className='text-base' style={{ color: 'var(--tx2)' }}>
              Your order is confirmed and on its way
            </p>
          </div>

          {/* Order ID badge */}
          {orderId && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className='flex items-center justify-between gap-3 mb-8 rounded-xl px-4 py-3'
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
              }}
            >
              <div className='flex items-center gap-3 min-w-0'>
                <div className='w-2 h-2 rounded-full bg-green-500 flex-shrink-0' style={{ boxShadow: '0 0 6px #22c55e' }} />
                <span className='text-xs uppercase tracking-widest flex-shrink-0' style={{ color: 'var(--tx3)' }}>Order</span>
                <span className='font-mono text-sm truncate' style={{ color: 'var(--tx)' }}>{orderId}</span>
              </div>
              <button
                onClick={copyOrderId}
                className='flex items-center gap-1.5 text-xs font-medium rounded-lg px-3 py-1.5 transition-all duration-200 flex-shrink-0'
                style={{
                  background: copied ? 'rgba(34,197,94,0.12)' : 'var(--card)',
                  color: copied ? '#22c55e' : 'var(--tx2)',
                  border: '1px solid',
                  borderColor: copied ? 'rgba(34,197,94,0.2)' : 'var(--border)',
                }}
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </motion.div>
          )}

          {/* Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className='rounded-2xl p-6 mb-8'
            style={{
              background: 'var(--card)',
              border: '1px solid var(--card-bdr)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <h3 className='font-bold text-sm text-[var(--tx)] mb-5' style={{ fontFamily: 'var(--font-family-display)' }}>
              Order Journey
            </h3>
            <div className='relative flex justify-between overflow-x-auto pb-2'>
              {/* Connector line */}
              <div className='absolute top-4 left-0 right-0 h-0.5' style={{ background: 'var(--border)' }} />
              <div className='absolute top-4 left-0 h-0.5 transition-all duration-700' style={{ background: 'linear-gradient(90deg, #22c55e, #22c55e)', width: '25%' }} />

              {orderSteps.map((step, i) => {
                const Icon = step.icon;
                return (
                <div key={step.label} className='flex flex-col items-center relative z-10'>
                  <div
                    className='w-8 h-8 rounded-full flex items-center justify-center text-sm mb-2'
                    style={{
                      background: i === 0
                        ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                        : 'var(--surface)',
                      border: i === 0 ? '2px solid #22c55e' : '1px solid var(--border)',
                      boxShadow: i === 0 ? '0 0 12px rgba(34,197,94,0.2)' : 'none',
                    }}
                  >
                    {i === 0 ? (
                      <Check size={14} className='text-white' />
                    ) : (
                      <Icon size={14} style={{ color: 'var(--tx3)' }} />
                    )}
                  </div>
                  <span className='text-[11px] font-medium whitespace-nowrap' style={{ color: i === 0 ? '#22c55e' : 'var(--tx3)' }}>
                    {step.label}
                  </span>
                  <span className='text-[10px] mt-0.5' style={{ color: 'var(--tx3)' }}>{step.time}</span>
                </div>
                );
              })}
            </div>
          </motion.div>

          {/* Bonus section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className='rounded-2xl p-6 mb-8 text-center'
            style={{
              background: 'var(--accent-dim)',
              border: '1px solid rgba(99,102,241,0.15)',
            }}
          >
            <Lightbulb size={16} className='inline-block mr-1.5 -mt-0.5' style={{ color: 'var(--accent)' }} />
            <p className='text-sm font-medium text-[var(--tx)] mb-1'>Pro Tip</p>
            <p className='text-xs' style={{ color: 'var(--tx2)' }}>
              Track your order anytime from your account dashboard. You&apos;ll also receive email updates at every step.
            </p>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className='flex flex-col gap-3'
          >
            <Link href='/products'
              className='flex items-center justify-center gap-2 font-bold py-4 rounded-2xl text-white transition-all duration-300'
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}
            >
              <ShoppingBag size={18} />
              Continue Shopping
            </Link>
            <Link href='/account/orders'
              className='flex items-center justify-center gap-2 font-medium py-3.5 rounded-2xl transition-all duration-200'
              style={{
                border: '1px solid var(--border)',
                color: 'var(--tx2)',
                background: 'var(--card)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <ArrowRight size={16} />
              View Order Details
            </Link>
            <Link href='/'
              className='flex items-center justify-center gap-1.5 text-center text-sm py-2 transition-colors'
              style={{ color: 'var(--tx3)' }}
            >
              <ArrowLeft size={14} />
              Back to Home
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <PageTransition>
      <Suspense fallback={
        <div className='flex items-center justify-center min-h-[60vh]' style={{ background: 'var(--bg)' }}>
          <div className='w-10 h-10 rounded-full border-2 border-t-transparent animate-spin'
            style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
        </div>
      }>
        <OrderConfirmationContent />
      </Suspense>
    </PageTransition>
  );
}
