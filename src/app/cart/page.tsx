'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Trash2, Plus, Minus, ShoppingBag, Tag, ArrowRight, Zap, ChevronRight } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';
import PageTransition from '@/components/layout/PageTransition';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

const fallbackColors = ['#6366f1','#8b5cf6','#ec4899','#f43f5e','#f97316','#22c55e','#14b8a6','#3b82f6'];

function ItemThumb({ name, image }: { name: string; image?: string }) {
  if (image) {
    return (
      <div className='relative w-[88px] h-[88px] sm:w-28 sm:h-28 rounded-2xl overflow-hidden shrink-0 bg-[var(--accent-dim)]'>
        <Image src={image} alt={name} fill sizes='112px' className='object-cover' unoptimized />
        <div className='absolute inset-0 bg-gradient-to-t from-black/10 to-transparent' />
      </div>
    );
  }
  const initial = name[0].toUpperCase();
  const hash = name.split('').reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0);
  const color = fallbackColors[Math.abs(hash) % fallbackColors.length];
  return (
    <div className='w-[88px] h-[88px] sm:w-28 sm:h-28 rounded-2xl flex items-center justify-center text-xl font-bold shrink-0'
      style={{ background: `${color}14`, color }}>
      {initial}
    </div>
  );
}

export default function CartPage() {
  const { items, removeItem, updateQty, getTotal, applyCoupon, couponCode, discount, clearCart } = useCartStore();
  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = subtotal > 50 ? 0 : 5.99;
  const total = subtotal - discount + shipping;

  const handleCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    try {
      const { data } = await api.post('/cart/coupon', { code: couponInput });
      applyCoupon(data.data.couponCode, data.data.discount);
      toast.success(`Coupon applied! You saved ${formatPrice(data.data.discount)}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  if (items.length === 0) return (
    <PageTransition>
      <div className='min-h-[calc(100vh-200px)] flex items-center justify-center px-4'>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className='text-center max-w-sm'
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className='w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-6'
            style={{ background: 'var(--accent-dim)' }}
          >
            <ShoppingBag size={36} strokeWidth={1.2} style={{ color: 'var(--accent)' }} />
          </motion.div>
          <h2 className='text-xl font-bold' style={{ color: 'var(--tx)' }}>Your cart is empty</h2>
          <p className='text-sm mt-2 mb-8' style={{ color: 'var(--tx2)' }}>
            Looks like you haven&rsquo;t discovered any gadgets yet
          </p>
          <Link href='/products'
            className='inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-white transition-all duration-200'
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
            }}
          >
            <Zap size={16} strokeWidth={2} />
            Start Shopping
          </Link>
        </motion.div>
      </div>
    </PageTransition>
  );

  return (
    <PageTransition>
      <div className='min-h-screen' style={{ background: 'var(--bg)' }}>
        {/* Hero header */}
        <div className='relative overflow-hidden border-b' style={{ borderColor: 'var(--card-bdr)' }}>
          <div className='absolute inset-0' style={{ background: 'var(--surface)' }} />
          <div className='absolute top-0 right-1/4 w-64 h-64 rounded-full pointer-events-none opacity-[0.04]'
            style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)' }} />
          <div className='relative z-10 max-w-6xl mx-auto px-4 py-12 sm:py-16'>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <div className='flex items-center justify-center gap-5'>
                <div className='w-14 h-14 rounded-2xl flex items-center justify-center shrink-0'
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                  <ShoppingCart size={22} strokeWidth={1.5} className='text-white' />
                </div>
                <div className='text-left'>
                  <div className='flex items-center gap-3'>
                    <h1 className='text-[28px] sm:text-[36px] font-extrabold tracking-tight leading-none'
                      style={{ color: 'var(--tx)', fontFamily: 'var(--font-family-display)' }}>
                      Your Cart
                    </h1>
                    <span className='text-[11px] font-bold px-2.5 py-1 rounded-full'
                      style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>
                      {items.length} item{items.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <p className='text-sm mt-1.5' style={{ color: 'var(--tx2)' }}>
                    ${subtotal.toFixed(2)} subtotal &middot; Free shipping over $50
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className='max-w-6xl mx-auto px-4 py-8'>
          <div className='grid lg:grid-cols-3 gap-8'>
            {/* Items */}
            <div className='lg:col-span-2 space-y-4'>
              <AnimatePresence mode='popLayout'>
                {items.map(item => (
                  <motion.div
                    key={item.variantSku}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -80, scale: 0.95 }}
                    transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                    className='rounded-2xl p-4 sm:p-5 flex gap-4 sm:gap-5 transition-all duration-200'
                    style={{
                      background: 'var(--card)',
                      border: '1px solid var(--card-bdr)',
                    }}
                  >
                    <ItemThumb name={item.name} image={item.image} />

                    <div className='flex-1 min-w-0 flex flex-col justify-between'>
                      <div>
                        <div className='flex items-start justify-between gap-2'>
                          <h3 className='text-sm sm:text-base font-semibold leading-snug line-clamp-2' style={{ color: 'var(--tx)' }}>
                            {item.name}
                          </h3>
                          <button onClick={() => removeItem(item.variantSku)}
                            className='w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-150'
                            style={{ color: 'var(--tx3)' }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#ef4444'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--tx3)'; }}
                          >
                            <Trash2 size={14} strokeWidth={1.5} />
                          </button>
                        </div>
                        <p className='text-xs mt-0.5 font-mono' style={{ color: 'var(--tx3)' }}>{item.variantSku}</p>
                        <p className='text-sm font-semibold mt-1' style={{ color: 'var(--accent)' }}>
                          ${item.price.toFixed(2)}
                        </p>
                      </div>

                      <div className='flex items-center justify-between mt-3 sm:mt-4'>
                        <div className='flex items-center rounded-xl overflow-hidden'
                          style={{ border: '1px solid var(--card-bdr)', background: 'var(--surface)' }}>
                          <button
                            onClick={() => item.quantity > 1 ? updateQty(item.variantSku, item.quantity - 1) : removeItem(item.variantSku)}
                            className='w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center transition-all duration-150'
                            style={{ color: 'var(--tx2)' }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-dim)'; e.currentTarget.style.color = 'var(--accent)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--tx2)'; }}
                          >
                            <Minus size={12} strokeWidth={2.5} />
                          </button>
                          <span className='w-8 sm:w-10 text-center text-sm font-bold' style={{ color: 'var(--tx)' }}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQty(item.variantSku, item.quantity + 1)}
                            className='w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center transition-all duration-150'
                            style={{ color: 'var(--tx2)' }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-dim)'; e.currentTarget.style.color = 'var(--accent)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--tx2)'; }}
                          >
                            <Plus size={12} strokeWidth={2.5} />
                          </button>
                        </div>
                        <span className='text-base sm:text-lg font-bold' style={{ color: 'var(--tx)' }}>
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              <Link href='/products'
                className='inline-flex items-center gap-1.5 text-sm font-medium transition-colors duration-150 mt-2'
                style={{ color: 'var(--tx2)' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--tx2)'; }}
              >
                <ChevronRight size={14} strokeWidth={2} style={{ transform: 'rotate(180deg)' }} />
                Continue Shopping
              </Link>
            </div>

            {/* Summary */}
            <div className='lg:col-span-1'>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className='rounded-2xl p-6 sticky top-24'
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--card-bdr)',
                }}
              >
                <h2 className='text-base font-bold mb-6' style={{ color: 'var(--tx)' }}>Order Summary</h2>

                {/* Coupon */}
                <div className='mb-6'>
                  <label className='block text-xs font-semibold mb-2' style={{ color: 'var(--tx2)' }}>
                    <Tag size={13} className='inline mr-1.5' strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
                    Coupon Code
                  </label>
                  {couponCode ? (
                    <div className='flex items-center gap-2 rounded-xl px-4 py-3'
                      style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
                      <span className='text-sm font-semibold flex-1' style={{ color: '#22c55e' }}>{couponCode}</span>
                      <span className='text-sm font-bold' style={{ color: '#22c55e' }}>-{formatPrice(discount)}</span>
                    </div>
                  ) : (
                    <div className='flex gap-2'>
                      <input
                        value={couponInput}
                        onChange={e => setCouponInput(e.target.value.toUpperCase())}
                        placeholder='Enter code'
                        className='flex-1 rounded-xl px-4 py-2.5 text-sm outline-none transition-all'
                        style={{
                          background: 'var(--surface)',
                          border: '1px solid var(--card-bdr)',
                          color: 'var(--tx)',
                        }}
                        onFocus={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
                        onBlur={e => { e.currentTarget.style.borderColor = 'var(--card-bdr)'; e.currentTarget.style.boxShadow = 'none'; }}
                      />
                      <button
                        onClick={handleCoupon}
                        disabled={couponLoading}
                        className='px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40'
                        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                      >
                        {couponLoading ? '…' : 'Apply'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Totals */}
                <div className='space-y-3 mb-6'>
                  <div className='flex justify-between text-sm' style={{ color: 'var(--tx2)' }}>
                    <span>Subtotal</span>
                    <span className='font-semibold' style={{ color: 'var(--tx)' }}>{formatPrice(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className='flex justify-between text-sm' style={{ color: '#22c55e' }}>
                      <span>Discount</span>
                      <span className='font-semibold'>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className='flex justify-between text-sm' style={{ color: 'var(--tx2)' }}>
                    <span>Shipping</span>
                    <span className={shipping === 0 ? 'text-green-500 font-semibold' : ''}>
                      {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                    </span>
                  </div>
                  {shipping > 0 && (
                    <p className='text-xs' style={{ color: 'var(--tx3)' }}>
                      Add {formatPrice(50 - subtotal)} more for free shipping
                    </p>
                  )}
                  <div className='pt-3 flex justify-between font-bold text-lg'
                    style={{ borderTop: '1px solid var(--card-bdr)', color: 'var(--tx)' }}>
                    <span>Total</span>
                    <motion.span
                      key={total}
                      initial={{ scale: 1.06 }}
                      animate={{ scale: 1 }}
                      style={{ color: 'var(--accent)' }}
                    >
                      {formatPrice(total)}
                    </motion.span>
                  </div>
                </div>

                <Link href='/checkout'
                  className='flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-bold text-white transition-all duration-200 active:scale-[0.98]'
                  style={{
                    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                    boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
                  }}
                >
                  Proceed to Checkout
                  <ArrowRight size={16} strokeWidth={2.5} />
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
