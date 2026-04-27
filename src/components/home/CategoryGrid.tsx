'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';

const categories = [
  { name: 'Smartphones', icon: '📱', color: 'from-blue-500 to-blue-600', slug: 'Smartphones' },
  { name: 'Laptops', icon: '💻', color: 'from-purple-500 to-purple-600', slug: 'Laptops' },
  { name: 'Headphones', icon: '🎧', color: 'from-pink-500 to-pink-600', slug: 'Headphones' },
  { name: 'Tablets', icon: '📟', color: 'from-green-500 to-green-600', slug: 'Tablets' },
  { name: 'Wearables', icon: '⌚', color: 'from-orange-500 to-orange-600', slug: 'Wearables' },
  { name: 'Gaming', icon: '🎮', color: 'from-red-500 to-red-600', slug: 'Gaming' },
  { name: 'Accessories', icon: '🖱️', color: 'from-teal-500 to-teal-600', slug: 'Accessories' },
  { name: 'Smart Home', icon: '🏠', color: 'from-indigo-500 to-indigo-600', slug: 'Smart Home' },
];

export default function CategoryGrid() {
  return (
    <section className='max-w-7xl mx-auto px-4 py-16'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className='text-center mb-10'
      >
        <h2 className='text-3xl font-bold text-gray-900'>Shop by Category</h2>
        <p className='text-gray-500 mt-2'>Find exactly what you're looking for</p>
      </motion.div>

      <div className='grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4'>
        {categories.map((cat, i) => (
          <motion.div
            key={cat.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
          >
            <Link href={`/products?category=${cat.slug}`}>
              <motion.div
                whileHover={{ y: -6, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`bg-gradient-to-br ${cat.color} rounded-2xl p-4 text-center text-white cursor-pointer shadow-md hover:shadow-xl transition-shadow`}
              >
                <div className='text-3xl mb-2'>{cat.icon}</div>
                <p className='text-xs font-semibold leading-tight'>{cat.name}</p>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
