'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, TrendingUp } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { useProducts } from '@/hooks/useProducts';

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function BestSellers() {
  const { data, isLoading } = useProducts({ limit: 4, sort: 'bestseller' });

  return (
    <section className='bg-gray-50 py-16'>
      <div className='max-w-7xl mx-auto px-4'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className='flex items-center justify-between mb-10'
        >
          <div>
            <div className='flex items-center gap-2 mb-1'>
              <TrendingUp size={20} className='text-brand-500' />
              <span className='text-brand-500 font-semibold text-sm'>Trending Now</span>
            </div>
            <h2 className='text-3xl font-bold text-gray-900'>Best Sellers</h2>
            <p className='text-gray-500 mt-1'>Most loved by our customers</p>
          </div>
          <Link href='/products?sort=bestseller'
            className='flex items-center gap-2 text-brand-600 font-semibold hover:gap-3 transition-all'>
            See More <ArrowRight size={18} />
          </Link>
        </motion.div>

        {isLoading ? (
          <div className='grid grid-cols-2 md:grid-cols-4 gap-5'>
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <motion.div
            className='grid grid-cols-2 md:grid-cols-4 gap-5'
            variants={containerVariants}
            initial='hidden'
            whileInView='show'
            viewport={{ once: true }}
          >
            {data?.products.map(product => (
              <motion.div key={product._id} variants={cardVariants}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
