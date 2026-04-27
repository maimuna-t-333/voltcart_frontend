'use client';
import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { SlidersHorizontal, X } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import PageTransition from '@/components/layout/PageTransition';
import { useProducts } from '@/hooks/useProducts';

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);

  const category = searchParams.get('category') || '';
  const search   = searchParams.get('search') || '';
  const sort     = searchParams.get('sort') || '';
  const page     = Number(searchParams.get('page')) || 1;

  const { data, isLoading } = useProducts({ category, search, sort, page, limit: 12 });

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete('page');
    router.push(`/products?${params.toString()}`);
  };

  const sortOptions = [
    { value: '', label: 'Recommended' },
    { value: 'newest', label: 'Newest First' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Top Rated' },
    { value: 'bestseller', label: 'Best Sellers' },
  ];

  const categories = ['Smartphones', 'Laptops', 'Headphones', 'Tablets', 'Wearables', 'Gaming', 'Accessories', 'Smart Home'];

  return (
    <div className='max-w-7xl mx-auto px-4 py-8'>
      {/* Header */}
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>
            {category || search ? `${category || `"${search}"`}` : 'All Products'}
          </h1>
          {data && <p className='text-gray-500 text-sm mt-1'>{data.total} products found</p>}
        </div>
        <div className='flex items-center gap-3'>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className='flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium hover:bg-gray-50 md:hidden'
          >
            <SlidersHorizontal size={16} />
            Filters
          </button>
          <select
            value={sort}
            onChange={e => updateParam('sort', e.target.value)}
            className='border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500'
          >
            {sortOptions.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Active filters */}
      {(category || search) && (
        <div className='flex gap-2 mb-6 flex-wrap'>
          {category && (
            <span className='flex items-center gap-1 bg-brand-50 text-brand-600 px-3 py-1 rounded-full text-sm font-medium'>
              {category}
              <button onClick={() => updateParam('category', '')}><X size={14}/></button>
            </span>
          )}
          {search && (
            <span className='flex items-center gap-1 bg-brand-50 text-brand-600 px-3 py-1 rounded-full text-sm font-medium'>
              "{search}"
              <button onClick={() => updateParam('search', '')}><X size={14}/></button>
            </span>
          )}
        </div>
      )}

      <div className='flex gap-8'>
        {/* Sidebar */}
        <aside className={`w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden'} md:block`}>
          <div className='bg-white rounded-2xl border border-gray-100 p-6 sticky top-20'>
            <h3 className='font-bold text-gray-900 mb-4'>Categories</h3>
            <ul className='space-y-2'>
              <li>
                <button
                  onClick={() => updateParam('category', '')}
                  className={`w-full text-left text-sm px-3 py-2 rounded-xl transition-colors ${!category ? 'bg-brand-500 text-white' : 'hover:bg-gray-50 text-gray-700'}`}
                >
                  All Products
                </button>
              </li>
              {categories.map(cat => (
                <li key={cat}>
                  <button
                    onClick={() => updateParam('category', cat)}
                    className={`w-full text-left text-sm px-3 py-2 rounded-xl transition-colors ${category === cat ? 'bg-brand-500 text-white' : 'hover:bg-gray-50 text-gray-700'}`}
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Products grid */}
        <div className='flex-1'>
          {isLoading ? (
            <div className='grid grid-cols-2 md:grid-cols-3 gap-5'>
              {Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : data?.products.length === 0 ? (
            <div className='text-center py-20'>
              <p className='text-6xl mb-4'>🔍</p>
              <h3 className='text-xl font-bold text-gray-900 mb-2'>No products found</h3>
              <p className='text-gray-500'>Try adjusting your filters or search term</p>
            </div>
          ) : (
            <>
              <motion.div
                className='grid grid-cols-2 md:grid-cols-3 gap-5'
                initial='hidden'
                animate='show'
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
              >
                {data?.products.map(product => (
                  <motion.div
                    key={product._id}
                    variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>

              {/* Pagination */}
              {data && data.pages > 1 && (
                <div className='flex justify-center gap-2 mt-10'>
                  {Array.from({ length: data.pages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => updateParam('page', String(i + 1))}
                      className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${page === i + 1 ? 'bg-brand-500 text-white' : 'border border-gray-200 hover:bg-gray-50'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <PageTransition>
      <Suspense fallback={<div className='p-8 text-center'>Loading...</div>}>
        <ProductsContent />
      </Suspense>
    </PageTransition>
  );
}
