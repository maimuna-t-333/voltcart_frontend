'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '@/components/layout/PageTransition';

const variants = {
  enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (d: number) => ({ x: d > 0 ? -300 : 300, opacity: 0 }),
};

function ContactStep({ onNext }: { onNext: ()=>void }) {
  return (
    <div className='space-y-4'>
      <h2 className='text-xl font-bold'>Contact Info</h2>
      <input placeholder='Full Name' className='w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500'/>
      <input placeholder='Email' className='w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500'/>
      <button onClick={onNext} className='w-full bg-brand-500 text-white py-3 rounded-xl font-semibold hover:bg-brand-600'>Continue</button>
    </div>
  );
}

function ShippingStep({ onNext, onBack }: { onNext: ()=>void, onBack: ()=>void }) {
  return (
    <div className='space-y-4'>
      <h2 className='text-xl font-bold'>Shipping Address</h2>
      <input placeholder='Address' className='w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500'/>
      <input placeholder='City' className='w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500'/>
      <div className='flex gap-3'>
        <button onClick={onBack} className='flex-1 border border-brand-500 text-brand-500 py-3 rounded-xl font-semibold'>Back</button>
        <button onClick={onNext} className='flex-1 bg-brand-500 text-white py-3 rounded-xl font-semibold hover:bg-brand-600'>Continue</button>
      </div>
    </div>
  );
}

function PaymentStep({ onBack }: { onBack: ()=>void }) {
  return (
    <div className='space-y-4'>
      <h2 className='text-xl font-bold'>Payment</h2>
      <input placeholder='Card Number' className='w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500'/>
      <input placeholder='Expiry & CVV' className='w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500'/>
      <div className='flex gap-3'>
        <button onClick={onBack} className='flex-1 border border-brand-500 text-brand-500 py-3 rounded-xl font-semibold'>Back</button>
        <button className='flex-1 bg-brand-500 text-white py-3 rounded-xl font-semibold hover:bg-brand-600'>Pay Now</button>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const [step, setStep] = useState(1);
  const [dir,  setDir]  = useState(1);

  const nextStep = () => { setDir(1);  setStep(s => s + 1); };
  const prevStep = () => { setDir(-1); setStep(s => s - 1); };

  return (
    <PageTransition>
      <div className='max-w-lg mx-auto px-4 py-12'>
        <h1 className='text-3xl font-bold mb-8 text-center'>Checkout</h1>
        {/* Step indicators */}
        <div className='flex justify-center gap-2 mb-8'>
          {[1,2,3].map(i => (
            <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step>=i ? 'bg-brand-500 text-white' : 'bg-gray-200 text-gray-400'}`}>{i}</div>
          ))}
        </div>
        <div className='overflow-hidden'>
          <AnimatePresence mode='wait' custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              variants={variants}
              initial='enter'
              animate='center'
              exit='exit'
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              {step === 1 && <ContactStep onNext={nextStep} />}
              {step === 2 && <ShippingStep onNext={nextStep} onBack={prevStep} />}
              {step === 3 && <PaymentStep onBack={prevStep} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
}
