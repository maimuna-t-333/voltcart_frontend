'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { useFeaturedProducts } from '@/hooks/useProducts';

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function FeaturedProducts() {
  const { data, isLoading } = useFeaturedProducts();

  return (
    <section className='max-w-7xl mx-auto px-4 py-16'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className='flex items-center justify-between mb-10'
      >
        <div>
          <h2 className='text-3xl font-bold text-gray-900'>Featured Products</h2>
          <p className='text-gray-500 mt-1'>Handpicked top gadgets for you</p>
        </div>
        <Link href='/products'
          className='flex items-center gap-2 text-brand-600 font-semibold hover:gap-3 transition-all'>
          View All <ArrowRight size={18} />
        </Link>
      </motion.div>

      {isLoading ? (
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5'>
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <motion.div
          className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5'
          variants={containerVariants}
          initial='hidden'
          whileInView='show'
          viewport={{ once: true }}
        >
          {data?.map(product => (
            <motion.div key={product._id} variants={cardVariants}>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
    
  );
}