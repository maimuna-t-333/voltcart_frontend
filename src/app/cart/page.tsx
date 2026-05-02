'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Trash2, Plus, Minus, ShoppingBag, Tag, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';
import PageTransition from '@/components/layout/PageTransition';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

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
      <div className='max-w-2xl mx-auto px-4 py-20 text-center'>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <ShoppingBag size={80} className='mx-auto text-gray-200 mb-6' />
          <h2 className='text-2xl font-bold text-gray-900 mb-2'>Your cart is empty</h2>
          <p className='text-gray-500 mb-8'>Looks like you haven't added anything yet</p>
          <Link href='/products'
            className='inline-flex items-center gap-2 bg-brand-500 text-white font-bold px-8 py-4 rounded-2xl hover:bg-brand-600 transition-colors'>
            <ShoppingBag size={20} />
            Start Shopping
          </Link>
        </motion.div>
      </div>
    </PageTransition>
  );

  return (
    <PageTransition>
      <div className='max-w-7xl mx-auto px-4 py-8'>
        <h1 className='text-2xl font-bold text-gray-900 mb-8'>
          Shopping Cart <span className='text-gray-400 font-normal text-lg'>({items.length} items)</span>
        </h1>

        <div className='grid lg:grid-cols-3 gap-8'>
          {/* Cart items */}
          <div className='lg:col-span-2 space-y-4'>
            <AnimatePresence mode='popLayout'>
              {items.map(item => (
                <motion.div
                  key={item.variantSku}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className='bg-white border border-gray-100 rounded-2xl p-5 flex gap-5 shadow-sm'
                >
                  <div className='w-24 h-24 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 text-4xl'>
                    {item.image ? (
  <img src={item.image} className='w-24 h-24 rounded-xl object-cover'/>
) : (
  <div className='w-24 h-24 bg-gray-50 rounded-xl flex items-center justify-center text-4xl'>📦</div>
)}
                  </div>
                  <div className='flex-1'>
                    <h3 className='font-semibold text-gray-900'>{item.name}</h3>
                    <p className='text-gray-500 text-sm mt-1'>SKU: {item.variantSku}</p>
                    <p className='text-brand-600 font-bold mt-2'>{formatPrice(item.price)}</p>
                  </div>
                  <div className='flex flex-col items-end justify-between'>
                    <button onClick={() => removeItem(item.variantSku)} className='text-gray-400 hover:text-red-400 transition-colors'>
                      <Trash2 size={18} />
                    </button>
                    <div className='flex items-center gap-3 bg-gray-50 rounded-xl p-1'>
                      <button
                        onClick={() => item.quantity > 1 ? updateQty(item.variantSku, item.quantity - 1) : removeItem(item.variantSku)}
                        className='w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-brand-50 transition-colors'
                      >
                        <Minus size={14} />
                      </button>
                      <span className='w-6 text-center font-semibold'>{item.quantity}</span>
                      <button
                        onClick={() => updateQty(item.variantSku, item.quantity + 1)}
                        className='w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-brand-50 transition-colors'
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <p className='font-bold text-gray-900'>{formatPrice(item.price * item.quantity)}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order summary */}
          <div className='lg:col-span-1'>
            <div className='bg-white border border-gray-100 rounded-2xl p-6 shadow-sm sticky top-20'>
              <h2 className='font-bold text-lg text-gray-900 mb-6'>Order Summary</h2>

              {/* Coupon */}
              <div className='mb-6'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  <Tag size={14} className='inline mr-1' />
                  Coupon Code
                </label>
                {couponCode ? (
                  <div className='flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3'>
                    <span className='text-green-600 font-medium text-sm flex-1'>{couponCode} applied!</span>
                    <span className='text-green-600 font-bold'>-{formatPrice(discount)}</span>
                  </div>
                ) : (
                  <div className='flex gap-2'>
                    <input
                      value={couponInput}
                      onChange={e => setCouponInput(e.target.value.toUpperCase())}
                      placeholder='Enter code'
                      className='flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500'
                    />
                    <button
                      onClick={handleCoupon}
                      disabled={couponLoading}
                      className='bg-brand-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-brand-600 disabled:bg-gray-300 transition-colors'
                    >
                      {couponLoading ? '...' : 'Apply'}
                    </button>
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className='space-y-3 mb-6'>
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-500'>Subtotal</span>
                  <span className='font-medium'>{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className='flex justify-between text-sm'>
                    <span className='text-green-600'>Discount</span>
                    <span className='text-green-600 font-medium'>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-500'>Shipping</span>
                  <span className={shipping === 0 ? 'text-green-600 font-medium' : 'font-medium'}>
                    {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className='text-xs text-gray-400'>Add {formatPrice(50 - subtotal)} more for free shipping</p>
                )}
                <div className='border-t border-gray-100 pt-3 flex justify-between font-bold text-lg'>
                  <span>Total</span>
                  <span className='text-brand-600'>{formatPrice(total)}</span>
                </div>
              </div>

              <Link href='/checkout'
                className='flex items-center justify-center gap-2 w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-4 rounded-2xl transition-colors'>
                Proceed to Checkout
                <ArrowRight size={18} />
              </Link>

              <Link href='/products'
                className='flex items-center justify-center gap-2 w-full border border-gray-200 text-gray-600 font-medium py-3 rounded-2xl mt-3 hover:bg-gray-50 transition-colors text-sm'>
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
