'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ShoppingBag, Zap } from 'lucide-react';

export default function HeroBanner() {
  return (
    <section className='relative overflow-hidden bg-gradient-to-br from-brand-900 via-brand-600 to-brand-500 min-h-[520px] flex items-center'>
      {/* Background decorative circles */}
      <div className='absolute top-[-80px] right-[-80px] w-[400px] h-[400px] bg-white/5 rounded-full' />
      <div className='absolute bottom-[-100px] right-[200px] w-[300px] h-[300px] bg-white/5 rounded-full' />
      <div className='absolute top-[50px] right-[350px] w-[150px] h-[150px] bg-white/10 rounded-full' />

      <div className='max-w-7xl mx-auto px-4 w-full grid md:grid-cols-2 gap-12 items-center py-16'>
        {/* Left content */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className='text-white'
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className='inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6'
          >
            <Zap size={14} className='fill-yellow-400 text-yellow-400' />
            New Arrivals — Up to 40% Off
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className='text-5xl md:text-6xl font-bold leading-tight mb-6'
          >
            Shop the
            <span className='block text-yellow-400'>Latest Gadgets</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className='text-white/80 text-lg mb-8 max-w-md'
          >
            Discover cutting-edge smartphones, laptops, audio gear, and more.
            Free shipping on orders over $50.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className='flex flex-wrap gap-4'
          >
            <Link href='/products'
              className='inline-flex items-center gap-2 bg-white text-brand-600 font-bold px-8 py-4 rounded-2xl hover:bg-yellow-400 hover:text-brand-900 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1'>
              <ShoppingBag size={20} />
              Shop Now
            </Link>
            <Link href='/products?sort=newest'
              className='inline-flex items-center gap-2 border-2 border-white/50 text-white font-bold px-8 py-4 rounded-2xl hover:bg-white/10 transition-all duration-300'>
              View Deals
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className='flex gap-8 mt-12'
          >
            {[
              { value: '500+', label: 'Products' },
              { value: '50K+', label: 'Customers' },
              { value: '4.9★', label: 'Rating' },
            ].map(stat => (
              <div key={stat.label}>
                <p className='text-2xl font-bold text-white'>{stat.value}</p>
                <p className='text-white/60 text-sm'>{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right — floating product cards */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className='hidden md:flex items-center justify-center relative h-80'
        >
          {[
            { name: 'iPhone 15 Pro', price: '$999', top: '0%', left: '10%', rotate: '-6deg' },
            { name: 'MacBook Air M2', price: '$1099', top: '20%', left: '40%', rotate: '4deg' },
            { name: 'Sony WH-1000XM5', price: '$349', top: '45%', left: '5%', rotate: '2deg' },
          ].map((item, i) => (
            <motion.div
              key={item.name}
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: i * 0.8 }}
              style={{ top: item.top, left: item.left, rotate: item.rotate }}
              className='absolute bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-4 text-white shadow-xl'
            >
              <div className='w-16 h-16 bg-white/20 rounded-xl mb-2 flex items-center justify-center text-2xl'>
                {i === 0 ? '📱' : i === 1 ? '💻' : '🎧'}
              </div>
              <p className='font-semibold text-sm'>{item.name}</p>
              <p className='text-yellow-400 font-bold'>{item.price}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
