'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { formatPrice } from '@/lib/utils';
import PageTransition from '@/components/layout/PageTransition';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { Check, CreditCard, MapPin, Truck, User } from 'lucide-react';
import Link from 'next/link';

const variants = {
  enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d: number) => ({ x: d > 0 ? -300 : 300, opacity: 0 }),
};

const steps = [
  { id: 1, label: 'Contact', icon: User },
  { id: 2, label: 'Shipping', icon: MapPin },
  { id: 3, label: 'Delivery', icon: Truck },
  { id: 4, label: 'Payment', icon: CreditCard },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, discount, couponCode, clearCart } = useCartStore();
  const user = useAuthStore(s => s.user);
  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);
  const [loading, setLoading] = useState(false);
  const [contact, setContact] = useState({ name: user?.name || '', email: user?.email || '', phone: '' });
  const [shipping, setShipping] = useState({ address: '', city: '', state: '', zip: '', country: 'US' });
  const [shippingMethod, setShippingMethod] = useState('standard');
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shippingCost = { standard: 5.99, express: 12.99, overnight: 24.99 }[shippingMethod] || 5.99;
  const total = subtotal - discount + (subtotal > 50 ? 0 : shippingCost);
  const nextStep = () => { setDir(1); setStep(s => Math.min(s + 1, 4)); };
  const prevStep = () => { setDir(-1); setStep(s => Math.max(s - 1, 1)); };

  const handlePayment = async () => {
  setLoading(true);
  try {
    const { data } = await api.post('/payments/intent', {
      shippingMethod,
      items: items.map(item => ({
        productId: item.productId,
        variantSku: item.variantSku,
        quantity: item.quantity,
        price: item.price,
        name: item.name,
      })),
      subtotal,
      discount,
      couponCode,
      shippingAddress: {      
        line1: shipping.address,
        city: shipping.city,
        state: shipping.state,
        zip: shipping.zip,
        country: shipping.country,
      },
    });
    if (data.data.clientSecret) {
      toast.success('Order placed! Redirecting...');
      clearCart();
      router.push(`/order-confirmation?orderId=${data.data.orderId}`);
    }
  } catch (err: any) {
    toast.error(err.response?.data?.message || 'Payment failed. Please try again.');
  } finally {
    setLoading(false);
  }
};

  if (items.length === 0) return (
    <div className='text-center py-20'>
      <p className='text-6xl mb-4'>🛒</p>
      <h2 className='text-2xl font-bold mb-4'>Your cart is empty</h2>
      <Link href='/products' className='text-brand-500 hover:underline'>Continue shopping</Link>
    </div>
  );

  return (
    <PageTransition>
      <div className='max-w-6xl mx-auto px-4 py-8'>
        <h1 className='text-2xl font-bold text-gray-900 mb-8'>Checkout</h1>

        {/* Step indicators */}
        <div className='flex items-center justify-center mb-10'>
          {steps.map((s, i) => (
            <div key={s.id} className='flex items-center'>
              <div className={`flex flex-col items-center ${i < steps.length - 1 ? 'mr-2' : ''}`}>
                <motion.div
                  animate={{ scale: step === s.id ? 1.1 : 1 }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                    step > s.id ? 'bg-green-500 text-white' : step === s.id ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {step > s.id ? <Check size={16} /> : <s.icon size={16} />}
                </motion.div>
                <span className={`text-xs mt-1 font-medium ${step === s.id ? 'text-brand-600' : 'text-gray-400'}`}>{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`h-0.5 w-12 mx-2 mb-5 transition-colors ${step > s.id ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        <div className='grid lg:grid-cols-3 gap-8'>
          {/* Form */}
          <div className='lg:col-span-2 overflow-hidden'>
            <AnimatePresence mode='wait' custom={dir}>
              <motion.div
                key={step}
                custom={dir}
                variants={variants}
                initial='enter'
                animate='center'
                exit='exit'
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className='bg-white border border-gray-100 rounded-2xl p-6 shadow-sm'
              >
                {/* Step 1 — Contact */}
                {step === 1 && (
                  <div className='space-y-4'>
                    <h2 className='text-lg font-bold text-gray-900 mb-6'>Contact Information</h2>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>Full Name</label>
                      <input value={contact.name} onChange={e => setContact({...contact, name: e.target.value})}
                        className='w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm' placeholder='John Doe' />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>Email</label>
                      <input type='email' value={contact.email} onChange={e => setContact({...contact, email: e.target.value})}
                        className='w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm' placeholder='john@example.com' />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>Phone</label>
                      <input value={contact.phone} onChange={e => setContact({...contact, phone: e.target.value})}
                        className='w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm' placeholder='+1 234 567 8900' />
                    </div>
                    <button onClick={nextStep} disabled={!contact.name || !contact.email}
                      className='w-full bg-brand-500 hover:bg-brand-600 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl transition-colors mt-4'>
                      Continue to Shipping
                    </button>
                  </div>
                )}

                {/* Step 2 — Shipping */}
                {step === 2 && (
                  <div className='space-y-4'>
                    <h2 className='text-lg font-bold text-gray-900 mb-6'>Shipping Address</h2>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>Street Address</label>
                      <input value={shipping.address} onChange={e => setShipping({...shipping, address: e.target.value})}
                        className='w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm' placeholder='123 Main St' />
                    </div>
                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>City</label>
                        <input value={shipping.city} onChange={e => setShipping({...shipping, city: e.target.value})}
                          className='w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm' placeholder='New York' />
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>ZIP Code</label>
                        <input value={shipping.zip} onChange={e => setShipping({...shipping, zip: e.target.value})}
                          className='w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm' placeholder='10001' />
                      </div>
                    </div>
                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>State</label>
                        <input value={shipping.state} onChange={e => setShipping({...shipping, state: e.target.value})}
                          className='w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm' placeholder='NY' />
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>Country</label>
                        <select value={shipping.country} onChange={e => setShipping({...shipping, country: e.target.value})}
                          className='w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm'>
                          <option value='US'>United States</option>
                          <option value='UK'>United Kingdom</option>
                          <option value='CA'>Canada</option>
                          <option value='AU'>Australia</option>
                        </select>
                      </div>
                    </div>
                    <div className='flex gap-3 mt-4'>
                      <button onClick={prevStep} className='flex-1 border border-gray-200 text-gray-600 font-medium py-3 rounded-xl hover:bg-gray-50 transition-colors'>Back</button>
                      <button onClick={nextStep} disabled={!shipping.address || !shipping.city}
                        className='flex-1 bg-brand-500 hover:bg-brand-600 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl transition-colors'>
                        Continue
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3 — Delivery Method */}
                {step === 3 && (
                  <div>
                    <h2 className='text-lg font-bold text-gray-900 mb-6'>Delivery Method</h2>
                    <div className='space-y-3'>
                      {[
                        { id: 'standard', label: 'Standard Shipping', desc: '5-7 business days', price: subtotal > 50 ? 'FREE' : '$5.99' },
                        { id: 'express', label: 'Express Shipping', desc: '2-3 business days', price: '$12.99' },
                        { id: 'overnight', label: 'Overnight Shipping', desc: 'Next business day', price: '$24.99' },
                      ].map(method => (
                        <label key={method.id}
                          className={`flex items-center gap-4 p-4 border-2 rounded-2xl cursor-pointer transition-colors ${shippingMethod === method.id ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-gray-300'}`}>
                          <input type='radio' name='shipping' value={method.id} checked={shippingMethod === method.id}
                            onChange={e => setShippingMethod(e.target.value)} className='text-brand-500' />
                          <div className='flex-1'>
                            <p className='font-semibold text-gray-900'>{method.label}</p>
                            <p className='text-gray-500 text-sm'>{method.desc}</p>
                          </div>
                          <span className={`font-bold ${method.price === 'FREE' ? 'text-green-600' : 'text-gray-900'}`}>{method.price}</span>
                        </label>
                      ))}
                    </div>
                    <div className='flex gap-3 mt-6'>
                      <button onClick={prevStep} className='flex-1 border border-gray-200 text-gray-600 font-medium py-3 rounded-xl hover:bg-gray-50 transition-colors'>Back</button>
                      <button onClick={nextStep} className='flex-1 bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 rounded-xl transition-colors'>Continue to Payment</button>
                    </div>
                  </div>
                )}

                {/* Step 4 — Payment */}
                {step === 4 && (
                  <div>
                    <h2 className='text-lg font-bold text-gray-900 mb-6'>Payment</h2>
                    <div className='bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6'>
                      <p className='text-blue-800 text-sm font-medium'>🔒 Secure payment powered by Stripe</p>
                      <p className='text-blue-600 text-xs mt-1'>Test card: 4242 4242 4242 4242 | Any future date | Any CVC</p>
                    </div>
                    <div className='space-y-4'>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>Card Number</label>
                        <input placeholder='4242 4242 4242 4242'
                          className='w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm' />
                      </div>
                      <div className='grid grid-cols-2 gap-4'>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-2'>Expiry Date</label>
                          <input placeholder='MM/YY'
                            className='w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm' />
                        </div>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-2'>CVC</label>
                          <input placeholder='123'
                            className='w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm' />
                        </div>
                      </div>
                    </div>
                    <div className='flex gap-3 mt-6'>
                      <button onClick={prevStep} className='flex-1 border border-gray-200 text-gray-600 font-medium py-3 rounded-xl hover:bg-gray-50 transition-colors'>Back</button>
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={handlePayment}
                        disabled={loading}
                        className='flex-1 bg-brand-500 hover:bg-brand-600 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl transition-colors'
                      >
                        {loading ? 'Processing...' : `Pay ${formatPrice(total)}`}
                      </motion.button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Order summary */}
          <div className='lg:col-span-1'>
            <div className='bg-white border border-gray-100 rounded-2xl p-6 shadow-sm sticky top-20'>
              <h2 className='font-bold text-lg text-gray-900 mb-4'>Order Summary</h2>
              <div className='space-y-3 mb-4'>
                {items.map(item => (
                  <div key={item.variantSku} className='flex justify-between text-sm'>
                    <span className='text-gray-600 flex-1 truncate'>{item.name} × {item.quantity}</span>
                    <span className='font-medium ml-2'>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className='border-t border-gray-100 pt-3 space-y-2'>
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-500'>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className='flex justify-between text-sm text-green-600'>
                    <span>Discount ({couponCode})</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-500'>Shipping</span>
                  <span>{subtotal > 50 ? 'FREE' : formatPrice(shippingCost)}</span>
                </div>
                <div className='flex justify-between font-bold text-lg pt-2 border-t border-gray-100'>
                  <span>Total</span>
                  <span className='text-brand-600'>{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
