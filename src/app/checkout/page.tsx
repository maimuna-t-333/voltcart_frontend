'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { formatPrice } from '@/lib/utils';
import PageTransition from '@/components/layout/PageTransition';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { Check, CreditCard, MapPin, Truck, User, ChevronLeft, Shield } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactSchema, type ContactFormData, shippingSchema, type ShippingFormData } from '@/lib/validations/checkout.schemas';

const slideVariants = {
  enter: (d: number) => ({ x: d > 0 ? 260 : -260, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d: number) => ({ x: d > 0 ? -260 : 260, opacity: 0 }),
};

const steps = [
  { id: 1, label: 'Contact', icon: User },
  { id: 2, label: 'Shipping', icon: MapPin },
  { id: 3, label: 'Delivery', icon: Truck },
  { id: 4, label: 'Payment', icon: CreditCard },
];

const inputClass =
  'w-full rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200 ' +
  'bg-[var(--surface)] text-[var(--tx)] border border-[var(--border)] ' +
  'placeholder:text-[var(--tx3)] ' +
  'focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_var(--accent-dim)]';

const labelClass = 'block text-sm font-medium text-[var(--tx2)] mb-2';

const fieldErrorClass = 'text-xs mt-1.5 text-red-500';

const deliveryMethods = [
  { id: 'standard', label: 'Standard Shipping', desc: '5-7 business days', price: 5.99 },
  { id: 'express', label: 'Express Shipping', desc: '2-3 business days', price: 12.99 },
  { id: 'overnight', label: 'Overnight Shipping', desc: 'Next business day', price: 24.99 },
];

const countries = [
  { value: 'US', label: 'United States' },
  { value: 'UK', label: 'United Kingdom' },
  { value: 'CA', label: 'Canada' },
  { value: 'AU', label: 'Australia' },
];

function CountrySelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = countries.find(c => c.value === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className='relative'>
      <button type='button' onClick={() => setOpen(v => !v)}
        className='w-full rounded-xl px-4 py-3 text-sm text-left flex items-center justify-between transition-all duration-200'
        style={{
          background: 'var(--surface)',
          color: 'var(--tx)',
          border: `1px solid ${open ? 'var(--accent)' : 'var(--border)'}`,
          boxShadow: open ? '0 0 0 3px var(--accent-dim)' : 'none',
        }}>
        <span>{selected?.label || 'Select country'}</span>
        <motion.svg animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.15 }}
          width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5'
          style={{ color: 'var(--tx2)' }}>
          <path d='M6 9l6 6 6-6' />
        </motion.svg>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.12 }}
            className='absolute top-full left-0 right-0 z-20 mt-1 rounded-xl overflow-hidden'
            style={{
              background: 'var(--card)',
              border: '1px solid var(--card-bdr)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            }}>
            {countries.map(c => (
              <button key={c.value} type='button' onClick={() => { onChange(c.value); setOpen(false); }}
                className='w-full text-left px-4 py-2.5 text-sm transition-colors duration-100'
                style={{
                  background: c.value === value ? 'var(--accent-dim)' : 'transparent',
                  color: c.value === value ? 'var(--accent)' : 'var(--tx)',
                }}
                onMouseEnter={e => { if (c.value !== value) e.currentTarget.style.background = 'var(--surface)'; }}
                onMouseLeave={e => { if (c.value !== value) e.currentTarget.style.background = 'transparent'; }}>
                {c.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, discount, couponCode, clearCart } = useCartStore();
  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);
  const [loading, setLoading] = useState(false);
  const [shippingMethod, setShippingMethod] = useState('standard');
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shippingCost = deliveryMethods.find(m => m.id === shippingMethod)?.price ?? 5.99;
  const total = subtotal - discount + (subtotal > 50 ? 0 : shippingCost);
  const prevStep = () => { setDir(-1); setStep(s => Math.max(s - 1, 1)) };
  const user = useAuthStore(s => s.user);
  const isLoading = useAuthStore(s => s.isLoading);

   useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }, [step]);

  if (!isLoading && !user) { router.replace('/auth/login?redirect=/checkout'); return null; }

  const { register: registerContact,
    handleSubmit: handleContact,
    formState: { errors: contactErrors } } = useForm<ContactFormData>({
      resolver: zodResolver(contactSchema),
      defaultValues: {
        name: user?.name || '',
        email: user?.email || '',
        phone: '',
      },
    });

  const {
    register: registerShipping,
    handleSubmit: handleShipping,
    setValue: setShippingValue,
    watch: watchShipping,
    getValues: getShippingValues,
    formState: { errors: shippingErrors } } = useForm<ShippingFormData>({
      resolver: zodResolver(shippingSchema),
      defaultValues: {
        address: '', city: '', state: '', zip: '', country: 'US',
      },
    });

  const onContactSubmit = () => {
    setDir(1);
    setStep(2);
  };

  const onShippingSubmit = () => {
    setDir(1);
    setStep(3);
  };

  const nextStep = () => { setDir(1); setStep(s => Math.min(s + 1, 4)) };

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
          image: item.image,
          slug: item.slug,
          variantColor: item.variantColor,
          variantStorage: item.variantStorage,
        })),
        subtotal,
        discount,
        couponCode,
        shippingAddress: {
          line1: getShippingValues('address'),
          city: getShippingValues('city'),
          state: getShippingValues('state'),
          zip: getShippingValues('zip'),
          country: getShippingValues('country'),
        }
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
    <PageTransition>
      <div className='max-w-2xl mx-auto px-4 py-20 text-center relative z-10'>
        <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}>
          <div className='w-24 h-24 rounded-3xl bg-[var(--card)] border border-[var(--card-bdr)] flex items-center justify-center mx-auto mb-6 backdrop-blur-xl'>
            <span className='text-4xl'>🛒</span>
          </div>
          <h2 className='text-2xl font-bold text-[var(--tx)] mb-2'>Your cart is empty</h2>
          <p className='text-[var(--tx2)] mb-8'>Looks like you haven't added anything yet</p>
          <Link href='/products'
            className='inline-flex items-center gap-2 font-bold px-8 py-4 rounded-2xl text-white transition-all duration-300'
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}>
            Start Shopping
          </Link>
        </motion.div>
      </div>
    </PageTransition>
  );

  return (
    <PageTransition>
      <div className='relative min-h-screen' style={{ background: 'var(--bg)' }}>
        {/* Grid overlay */}
        <div className='fixed inset-0 pointer-events-none hb-grid-overlay' />

        {/* Glowing orbs */}
        <div className='fixed top-20 left-1/4 w-[400px] h-[400px] rounded-full pointer-events-none'
          style={{ background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)', opacity: 0.5 }} />
        <div className='fixed bottom-20 right-1/4 w-[350px] h-[350px] rounded-full pointer-events-none'
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)', opacity: 0.4 }} />

        <div className='relative z-10 max-w-6xl mx-auto px-4 py-8'>
          {/* Back link */}
          <Link href='/cart'
            className='inline-flex items-center gap-1.5 text-sm text-[var(--tx2)] hover:text-[var(--accent)] transition-colors mb-6 group'>
            <ChevronLeft size={16} className='transition-transform group-hover:-translate-x-0.5' />
            Back to Cart
          </Link>

          <h1 className='text-2xl font-bold text-[var(--tx)] mb-8' style={{ fontFamily: 'var(--font-family-display)' }}>Checkout</h1>

          {/* Step indicator */}
          <div className='flex items-center justify-center mb-10 overflow-x-auto'>
            {steps.map((s, i) => (
              <div key={s.id} className='flex items-center'>
                <div className='flex flex-col items-center'>
                  <motion.div
                    animate={{ scale: step === s.id ? 1.1 : 1 }}
                    className='relative w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm backdrop-blur-xl transition-all duration-300'
                    style={{
                      background: step > s.id
                        ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                        : step === s.id
                          ? 'linear-gradient(135deg, var(--accent), var(--accent2))'
                          : 'var(--surface)',
                      color: step >= s.id ? '#fff' : 'var(--tx3)',
                      border: step === s.id ? '2px solid var(--accent)' : '1px solid var(--border)',
                      boxShadow: step === s.id ? '0 0 20px var(--accent-glow)' : 'none',
                    }}
                  >
                    {step > s.id ? <Check size={16} /> : <s.icon size={16} />}
                  </motion.div>
                  <span className='text-xs mt-2 font-medium transition-colors duration-300'
                    style={{ color: step === s.id ? 'var(--accent)' : 'var(--tx3)' }}>
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className='w-8 sm:w-14 h-0.5 mx-1 sm:mx-2 mb-6 rounded-full transition-colors duration-500 shrink-0'
                    style={{
                      background: step > s.id
                        ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                        : 'var(--border)',
                    }} />
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
                  variants={slideVariants}
                  initial='enter'
                  animate='center'
                  exit='exit'
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className='rounded-2xl p-6 backdrop-blur-xl border'
                  style={{
                    background: 'var(--card)',
                    borderColor: 'var(--card-bdr)',
                  }}
                >
                  {/* Step 1 — Contact */}
                  {step === 1 && (
                    <form onSubmit={handleContact(onContactSubmit)} className='space-y-4'>
                      <h2 className='text-lg font-bold text-[var(--tx)] mb-6'>Contact Information</h2>

                      <div>
                        <label className={labelClass}>Full Name</label>
                        <input
                          {...registerContact('name')}
                          className={`${inputClass} ${contactErrors.name ? '!border-red-400 !shadow-[0_0_0_3px_rgba(248,113,113,0.15)]' : ''}`}
                          placeholder='John Doe'
                        />
                        {contactErrors.name && <p className={fieldErrorClass}>{contactErrors.name.message}</p>}
                      </div>

                      <div>
                        <label className={labelClass}>Email</label>
                        <input
                          {...registerContact('email')}
                          type='email'
                          className={`${inputClass} ${contactErrors.email ? '!border-red-400 !shadow-[0_0_0_3px_rgba(248,113,113,0.15)]' : ''}`}
                          placeholder='john@example.com'
                        />
                        {contactErrors.email && <p className={fieldErrorClass}>{contactErrors.email.message}</p>}
                      </div>

                      <div>
                        <label className={labelClass}>Phone</label>
                        <input
                          {...registerContact('phone')}
                          className={`${inputClass} ${contactErrors.phone ? '!border-red-400 !shadow-[0_0_0_3px_rgba(248,113,113,0.15)]' : ''}`}
                          placeholder='+1 234 567 8900'
                        />
                        {contactErrors.phone && <p className={fieldErrorClass}>{contactErrors.phone.message}</p>}
                      </div>

                      <button
                        type='submit'
                        className='w-full font-bold py-3.5 rounded-xl text-white transition-all duration-300 mt-4 border-0 cursor-pointer'
                        style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}
                      >
                        Continue to Shipping
                      </button>
                    </form>
                  )}

                  {/* Step 2 — Shipping */}
                  {step === 2 && (
                    <form onSubmit={handleShipping(onShippingSubmit)} className='space-y-4'>
                      <h2 className='text-lg font-bold text-[var(--tx)] mb-6'>Shipping Address</h2>

                      <div>
                        <label className={labelClass}>Street Address</label>
                        <input
                          {...registerShipping('address')}
                          className={`${inputClass} ${shippingErrors.address ? '!border-red-400 !shadow-[0_0_0_3px_rgba(248,113,113,0.15)]' : ''}`}
                          placeholder='123 Main St'
                        />
                        {shippingErrors.address && <p className={fieldErrorClass}>{shippingErrors.address.message}</p>}
                      </div>

                      <div className='grid grid-cols-2 gap-4'>
                        <div>
                          <label className={labelClass}>City</label>
                          <input
                            {...registerShipping('city')}
                            className={`${inputClass} ${shippingErrors.city ? '!border-red-400 !shadow-[0_0_0_3px_rgba(248,113,113,0.15)]' : ''}`}
                            placeholder='New York'
                          />
                          {shippingErrors.city && <p className={fieldErrorClass}>{shippingErrors.city.message}</p>}
                        </div>
                        <div>
                          <label className={labelClass}>ZIP Code</label>
                          <input
                            {...registerShipping('zip')}
                            className={`${inputClass} ${shippingErrors.zip ? '!border-red-400 !shadow-[0_0_0_3px_rgba(248,113,113,0.15)]' : ''}`}
                            placeholder='10001'
                          />
                          {shippingErrors.zip && <p className={fieldErrorClass}>{shippingErrors.zip.message}</p>}
                        </div>
                      </div>

                      <div className='grid grid-cols-2 gap-4'>
                        <div>
                          <label className={labelClass}>State</label>
                          <input
                            {...registerShipping('state')}
                            className={`${inputClass} ${shippingErrors.state ? '!border-red-400 !shadow-[0_0_0_3px_rgba(248,113,113,0.15)]' : ''}`}
                            placeholder='NY'
                          />
                          {shippingErrors.state && <p className={fieldErrorClass}>{shippingErrors.state.message}</p>}
                        </div>
                        <div>
                          <label className={labelClass}>Country</label>
                          <CountrySelect
                            value={watchShipping('country') || 'US'}
                            onChange={v => setShippingValue('country', v)}
                          />
                        </div>
                      </div>

                      <div className='flex gap-3 mt-4'>
                        <button
                          type='button'
                          onClick={prevStep}
                          className='flex-1 font-medium py-3.5 rounded-xl transition-all duration-200 cursor-pointer'
                          style={{
                            border: '1px solid var(--border)',
                            color: 'var(--tx2)',
                            background: 'transparent',
                          }}
                        >
                          Back
                        </button>
                        <button
                          type='submit'
                          className='flex-1 font-bold py-3.5 rounded-xl text-white transition-all duration-300 border-0 cursor-pointer'
                          style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}
                        >
                          Continue
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Step 3 — Delivery */}
                  {step === 3 && (
                    <div>
                      <h2 className='text-lg font-bold text-[var(--tx)] mb-6'>Delivery Method</h2>
                      <div className='space-y-3'>
                        {deliveryMethods.map(method => {
                          const selected = shippingMethod === method.id;
                          const displayPrice = subtotal > 50 && method.id === 'standard' ? 'FREE' : formatPrice(method.price);
                          return (
                            <label key={method.id}
                              className='flex items-center gap-4 p-5 rounded-2xl cursor-pointer transition-all duration-200'
                              style={{
                                border: `2px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
                                background: selected ? 'var(--accent-dim)' : 'var(--surface)',
                                boxShadow: selected ? '0 0 20px var(--accent-glow)' : 'none',
                              }}
                            >
                              <span
                                onClick={() => setShippingMethod(method.id)}
                                className='w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200'
                                style={{
                                  border: `2px solid ${selected ? 'var(--accent)' : 'var(--border-hi)'}`,
                                  background: selected ? 'var(--accent)' : 'transparent',
                                }}
                              >
                                {selected && <span className='w-2 h-2 rounded-full bg-white' />}
                              </span>
                              <div className='flex-1'>
                                <p className='font-semibold text-[var(--tx)]'>{method.label}</p>
                                <p className='text-sm mt-0.5' style={{ color: 'var(--tx2)' }}>{method.desc}</p>
                              </div>
                              <span className={`font-bold ${displayPrice === 'FREE' ? 'text-green-500' : ''}`}
                                style={{ color: displayPrice !== 'FREE' ? 'var(--tx)' : undefined }}>
                                {displayPrice}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                      <div className='flex gap-3 mt-6'>
                        <button
                          type='button'
                          onClick={prevStep}
                          className='flex-1 font-medium py-3.5 rounded-xl transition-all duration-200 cursor-pointer'
                          style={{
                            border: '1px solid var(--border)',
                            color: 'var(--tx2)',
                            background: 'transparent',
                          }}
                        >
                          Back
                        </button>
                        <button
                          type='button'
                          onClick={nextStep}
                          className='flex-1 font-bold py-3.5 rounded-xl text-white transition-all duration-300 border-0 cursor-pointer'
                          style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}
                        >
                          Continue to Payment
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 4 — Payment */}
                  {step === 4 && (
                    <div>
                      <h2 className='text-lg font-bold mb-1' style={{ color: 'var(--tx)' }}>Payment</h2>
                      <p className='text-sm mb-6' style={{ color: 'var(--tx2)' }}>Enter your card details to complete the order</p>

                      {/* Card fields */}
                      <div className='space-y-3'>
                        <div>
                          <label className={labelClass}>Card Number</label>
                          <input placeholder='4242 4242 4242 4242'
                            className={`${inputClass} font-mono tracking-widest`} />
                        </div>
                        <div className='grid grid-cols-2 gap-3'>
                          <div>
                            <label className={labelClass}>Expiry Date</label>
                            <input placeholder='MM/YY' className={`${inputClass} font-mono`} />
                          </div>
                          <div>
                            <label className={labelClass}>CVC</label>
                            <input placeholder='123' className={`${inputClass} font-mono`} />
                          </div>
                        </div>
                        <div>
                          <label className={labelClass}>Cardholder Name</label>
                          <input placeholder='John Doe' className={inputClass} />
                        </div>
                      </div>

                      {/* Security note */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.08 }}
                        className='flex items-center gap-2.5 px-4 py-3 rounded-xl mt-4 mb-5'
                        style={{
                          background: 'var(--accent-dim)',
                          border: '1px solid rgba(99,102,241,0.12)',
                        }}
                      >
                        <Shield size={14} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
                        <p className='text-xs' style={{ color: 'var(--tx2)' }}>
                          Use <span className='font-mono font-semibold' style={{ color: 'var(--accent)' }}>4242 4242 4242 4242</span>, any future date, any CVC
                        </p>
                      </motion.div>

                      {/* Buttons */}
                      <div className='flex gap-3'>
                        <button type='button' onClick={prevStep}
                          className='flex-1 font-medium py-3.5 rounded-xl cursor-pointer transition-all duration-200'
                          style={{
                            border: '1px solid var(--border)',
                            color: 'var(--tx2)',
                            background: 'transparent',
                          }}>
                          Back
                        </button>
                        <motion.button
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={handlePayment}
                          disabled={loading}
                          className='flex-[2] font-bold py-3.5 rounded-xl text-white transition-all duration-300 border-0 cursor-pointer disabled:opacity-40'
                          style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}>
                          {loading ? (
                            <span className='flex items-center justify-center gap-2'>
                              <span className='w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin' />
                              Processing…
                            </span>
                          ) : `Pay ${formatPrice(total)}`}
                        </motion.button>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Order summary sidebar */}
            <div className='lg:col-span-1'>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className='rounded-2xl p-6 backdrop-blur-xl border sticky top-20'
                style={{
                  background: 'var(--card)',
                  borderColor: 'var(--card-bdr)',
                }}
              >
                <h2 className='font-bold text-lg text-[var(--tx)] mb-5'
                  style={{ fontFamily: 'var(--font-family-display)' }}>
                  Order Summary
                </h2>

                {/* Step progress */}
                <div className='flex items-center gap-2 mb-5 pb-4' style={{ borderBottom: '1px solid var(--border)' }}>
                  {steps.map((s, i) => (
                    <div key={s.id} className='flex items-center gap-2'>
                      <div
                        className='w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300'
                        style={{
                          background: step > s.id
                            ? '#22c55e'
                            : step === s.id
                              ? 'var(--accent)'
                              : 'var(--surface)',
                          color: step >= s.id ? '#fff' : 'var(--tx3)',
                        }}
                      >
                        {step > s.id ? <Check size={10} /> : s.id}
                      </div>
                      {i < steps.length - 1 && (
                        <div className='w-5 h-px rounded' style={{ background: step > s.id ? '#22c55e' : 'var(--border)' }} />
                      )}
                    </div>
                  ))}
                  <span className='text-xs ml-auto' style={{ color: 'var(--tx3)' }}>Step {step}/4</span>
                </div>

                {/* Items */}
                <div className='space-y-3 mb-5'>
                  {items.map((item, i) => (
                    <motion.div
                      key={item.variantSku}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className='flex items-center gap-3'
                    >
                      <div className='w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden'
                        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                        {item.image ? (
                          <img src={item.image} className='w-full h-full object-cover' />
                        ) : (
                          <span>📦</span>
                        )}
                      </div>
                      <div className='flex-1 min-w-0'>
                        <p className='text-sm font-medium text-[var(--tx)] truncate'>{item.name}</p>
                        <p className='text-xs' style={{ color: 'var(--tx2)' }}>×{item.quantity}</p>
                      </div>
                      <span className='text-sm font-semibold text-[var(--tx)] whitespace-nowrap'>{formatPrice(item.price * item.quantity)}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Totals */}
                <div className='space-y-2 pt-4' style={{ borderTop: '1px solid var(--border)' }}>
                  <div className='flex justify-between text-sm'>
                    <span style={{ color: 'var(--tx2)' }}>Subtotal</span>
                    <span className='font-medium text-[var(--tx)]'>{formatPrice(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className='flex justify-between text-sm'>
                      <span className='text-green-500'>Discount ({couponCode})</span>
                      <span className='text-green-500 font-medium'>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className='flex justify-between text-sm'>
                    <span style={{ color: 'var(--tx2)' }}>Shipping</span>
                    <span className={`font-medium ${subtotal > 50 ? 'text-green-500' : ''}`}
                      style={{ color: subtotal > 50 ? undefined : 'var(--tx)' }}>
                      {subtotal > 50 ? 'FREE' : formatPrice(shippingCost)}
                    </span>
                  </div>
                  <div className='flex justify-between font-bold text-lg pt-3'
                    style={{ borderTop: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--tx)' }}>Total</span>
                    <span style={{ color: 'var(--accent)' }}>{formatPrice(total)}</span>
                  </div>
                </div>

                {subtotal <= 50 && subtotal > 0 && (
                  <p className='text-xs mt-3' style={{ color: 'var(--tx3)' }}>
                    Add {formatPrice(50 - subtotal)} more for free shipping
                  </p>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
