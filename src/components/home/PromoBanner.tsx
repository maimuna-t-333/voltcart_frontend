'use client';
import { motion } from 'framer-motion';
import { Truck, RotateCcw, Shield, Headphones } from 'lucide-react';

const perks = [
  { icon: Truck, title: 'Free Shipping', desc: 'On orders over $50' },
  { icon: RotateCcw, title: '30-Day Returns', desc: 'Hassle-free returns' },
  { icon: Shield, title: '2-Year Warranty', desc: 'On all electronics' },
  { icon: Headphones, title: '24/7 Support', desc: 'AI-powered chat' },
];

export default function PromoBanner() {
  return (
    <section className='max-w-7xl mx-auto px-4 py-12'>
      <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
        {perks.map((perk, i) => (
          <motion.div
            key={perk.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className='flex items-center gap-4 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow'
          >
            <div className='w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0'>
              <perk.icon size={22} className='text-brand-500' />
            </div>
            <div>
              <p className='font-bold text-gray-900 text-sm'>{perk.title}</p>
              <p className='text-gray-500 text-xs mt-0.5'>{perk.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
