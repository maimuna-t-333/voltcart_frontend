'use client';
import { motion } from 'framer-motion';
import ProductCard from '@/components/product/ProductCard';
import PageTransition from '@/components/layout/PageTransition';

const testProducts = [
  { _id: '1', slug: 'samsung-galaxy-s24', name: 'Samsung Galaxy S24', brand: 'Samsung', basePrice: 799, comparePrice: 899, avgRating: 4.5, reviewCount: 120, variants: [{ sku: 'SGS24-BLK-128', price: 799, images: [] }] },
  { _id: '2', slug: 'apple-iphone-15-pro', name: 'Apple iPhone 15 Pro', brand: 'Apple', basePrice: 999, comparePrice: 1099, avgRating: 4.8, reviewCount: 200, variants: [{ sku: 'IP15P-NTT-128', price: 999, images: [] }] },
  { _id: '3', slug: 'sony-wh-1000xm5', name: 'Sony WH-1000XM5', brand: 'Sony', basePrice: 349, comparePrice: 399, avgRating: 4.7, reviewCount: 85, variants: [{ sku: 'SWH5-BLK', price: 349, images: [] }] },
  { _id: '4', slug: 'apple-macbook-air-m2', name: 'MacBook Air M2', brand: 'Apple', basePrice: 1099, comparePrice: 1199, avgRating: 4.9, reviewCount: 150, variants: [{ sku: 'MBA-M2-SLV-256', price: 1099, images: [] }] },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function Home() {
  return (
    <PageTransition>
      <div className='max-w-7xl mx-auto px-4 py-8'>
        <motion.div
          className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5'
          variants={containerVariants}
          initial='hidden'
          animate='show'
        >
          {testProducts.map(product => (
            <motion.div key={product._id} variants={cardVariants}>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </PageTransition>
  );
}