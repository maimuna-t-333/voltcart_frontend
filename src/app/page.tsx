'use client';
import ProductCard from '@/components/product/ProductCard';
import PageTransition from '@/components/layout/PageTransition';

const testProduct = {
  _id: '123',
  slug: 'test-product',
  name: 'Samsung Galaxy S24',
  brand: 'Samsung',
  basePrice: 799,
  comparePrice: 899,
  avgRating: 4.5,
  reviewCount: 120,
  variants: [{ sku: 'SGS24-BLK-128', price: 799, images: [] }]
};

export default function Home() {
  return (
    <PageTransition>
      <div className='max-w-7xl mx-auto px-4 py-8'>
        <div className='grid grid-cols-4 gap-6'>
          <ProductCard product={testProduct} />
        </div>
      </div>
    </PageTransition>
  );
}