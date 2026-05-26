'use client';
import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import PageTransition from '@/components/layout/PageTransition';
import { useProducts } from '@/hooks/useProducts';

const stagger: any = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const fadeUp: any = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
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

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  const category = searchParams.get('category') || '';
  const search   = searchParams.get('search') || '';
  const sort     = searchParams.get('sort') || '';
  const page     = Number(searchParams.get('page')) || 1;

  const { data, isLoading } = useProducts({ category, search, sort, page, limit: 12 });

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete('page');
    router.push(`/products?${params.toString()}`);
  };

  const currentSortLabel = sortOptions.find(o => o.value === sort)?.label || 'Recommended';

  return (
    <div className='relative min-h-screen' style={{ background: 'var(--bg)' }}>
      {/* grid overlay + glow */}
      <div className='absolute inset-0 hb-grid-overlay' />
      <div aria-hidden className='pointer-events-none absolute inset-0'>
        <div className='absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-[150px] opacity-40' style={{ background: 'var(--accent-glow)' }} />
      </div>

      <div className='relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12'>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className='flex items-center justify-between mb-6'
        >
          <div>
            <h1 className='text-[26px] font-bold tracking-tight leading-tight' style={{ color: 'var(--tx)' }}>
              {category || search ? `${category || `"${search}"`}` : 'All Products'}
            </h1>
            {data && (
              <p className='text-sm mt-0.5' style={{ color: 'var(--tx2)' }}>
                {data.total} product{data.total !== 1 ? 's' : ''} found
              </p>
            )}
          </div>
          <div className='flex items-center gap-2.5'>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className='flex items-center gap-2 rounded-xl px-4 h-10 text-sm font-medium transition-all duration-200 md:hidden'
              style={{
                color: 'var(--tx2)',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
              }}
            >
              <SlidersHorizontal size={15} />
              Filters
            </button>

            {/* custom sort dropdown */}
            <div className='relative' ref={sortRef}>
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className='flex items-center gap-2 rounded-xl px-4 h-10 text-sm font-medium transition-all duration-200'
                style={{
                  color: 'var(--tx2)',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                }}
              >
                {currentSortLabel}
                <motion.span animate={{ rotate: sortOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown size={14} />
                </motion.span>
              </button>
              <AnimatePresence>
                {sortOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.96 }}
                    transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                    className='absolute right-0 mt-2 w-[200px] rounded-xl z-30 overflow-hidden'
                    style={{
                      background: 'var(--card)',
                      border: '1px solid var(--card-bdr)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.06)',
                      backdropFilter: 'blur(16px)',
                    }}
                  >
                    {sortOptions.map(o => (
                      <button
                        key={o.value}
                        onClick={() => { updateParam('sort', o.value); setSortOpen(false); }}
                        className='w-full text-left px-4 py-2.5 text-sm transition-colors duration-150'
                        style={{
                          color: sort === o.value ? 'var(--accent)' : 'var(--tx)',
                          background: sort === o.value ? 'var(--accent-dim)' : 'transparent',
                        }}
                      >
                        {o.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Active filter pills */}
        {(category || search) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className='flex gap-2 mb-6 flex-wrap overflow-hidden'
          >
            {category && (
              <span
                className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium transition-all duration-200'
                style={{
                  color: 'var(--accent)',
                  background: 'var(--accent-dim)',
                }}
              >
                {category}
                <button onClick={() => updateParam('category', '')} className='hover:opacity-70 transition-opacity'>
                  <X size={13} />
                </button>
              </span>
            )}
            {search && (
              <span
                className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium transition-all duration-200'
                style={{
                  color: 'var(--accent)',
                  background: 'var(--accent-dim)',
                }}
              >
                &ldquo;{search}&rdquo;
                <button onClick={() => updateParam('search', '')} className='hover:opacity-70 transition-opacity'>
                  <X size={13} />
                </button>
              </span>
            )}
          </motion.div>
        )}

        {/* Main layout */}
        <div className='flex gap-8'>
          {/* Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className={`w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden'} md:block`}
          >
            <div
              className='rounded-2xl p-6 sticky top-24 backdrop-blur-xl transition-colors duration-300'
              style={{
                background: 'var(--card)',
                border: '1px solid var(--card-bdr)',
              }}
            >
              <h3 className='font-bold text-sm mb-4' style={{ color: 'var(--tx)' }}>
                Categories
              </h3>
              <ul className='space-y-1'>
                <li>
                  <button
                    onClick={() => updateParam('category', '')}
                    className='w-full text-left text-sm px-3 py-2 rounded-xl transition-all duration-200'
                    style={{
                      color: !category ? '#fff' : 'var(--tx2)',
                      background: !category ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'transparent',
                    }}
                  >
                    All Products
                  </button>
                </li>
                {categories.map(cat => (
                  <li key={cat}>
                    <button
                      onClick={() => updateParam('category', cat)}
                      className='w-full text-left text-sm px-3 py-2 rounded-xl transition-all duration-200'
                      style={{
                        color: category === cat ? 'var(--accent)' : 'var(--tx2)',
                        background: category === cat ? 'var(--accent-dim)' : 'transparent',
                      }}
                    >
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </motion.aside>

          {/* Product grid */}
          <div className='flex-1 min-w-0'>
            {isLoading ? (
              <motion.div
                className='grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5'
                variants={stagger}
                initial='hidden'
                animate='show'
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <motion.div key={i} variants={fadeUp}>
                    <ProductCardSkeleton />
                  </motion.div>
                ))}
              </motion.div>
            ) : data?.products.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className='text-center py-24'
              >
                <div
                  className='w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5'
                  style={{ background: 'var(--accent-dim)' }}
                >
                  <svg width='28' height='28' viewBox='0 0 24 24' fill='none' stroke='var(--accent)' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'>
                    <circle cx='11' cy='11' r='8' />
                    <path d='m21 21-4.35-4.35' />
                  </svg>
                </div>
                <h3 className='text-xl font-bold mb-1' style={{ color: 'var(--tx)' }}>
                  No products found
                </h3>
                <p className='text-sm' style={{ color: 'var(--tx2)' }}>
                  Try adjusting your filters or search term
                </p>
              </motion.div>
            ) : (
              <>
                <motion.div
                  className='grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5'
                  variants={stagger}
                  initial='hidden'
                  animate='show'
                >
                  {data?.products.map(product => (
                    <motion.div key={product._id} variants={fadeUp}>
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </motion.div>

                {/* Pagination */}
                {data && data.pages > 1 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className='flex items-center justify-center gap-2 mt-10 pb-4'
                  >
                    <button
                      onClick={() => updateParam('page', String(page - 1))}
                      disabled={page <= 1}
                      className='flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 disabled:opacity-30'
                      style={{
                        color: 'var(--tx2)',
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    {Array.from({ length: data.pages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => updateParam('page', String(i + 1))}
                        className='w-10 h-10 rounded-xl text-sm font-medium transition-all duration-200'
                        style={{
                          color: page === i + 1 ? '#fff' : 'var(--tx2)',
                          background: page === i + 1 ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'var(--surface)',
                          border: page === i + 1 ? 'none' : '1px solid var(--border)',
                          boxShadow: page === i + 1 ? '0 4px 12px rgba(99,102,241,0.3)' : 'none',
                        }}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => updateParam('page', String(page + 1))}
                      disabled={page >= data.pages}
                      className='flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 disabled:opacity-30'
                      style={{
                        color: 'var(--tx2)',
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <PageTransition>
      <Suspense
        fallback={
          <div className='min-h-screen flex items-center justify-center' style={{ background: 'var(--bg)' }}>
            <div className='flex flex-col items-center gap-3'>
              <div className='w-6 h-6 rounded-full border-2 border-transparent animate-spin' style={{ borderTopColor: 'var(--accent)', borderRightColor: 'var(--accent)' }} />
              <p className='text-sm' style={{ color: 'var(--tx2)' }}>Loading products...</p>
            </div>
          </div>
        }
      >
        <ProductsContent />
      </Suspense>
    </PageTransition>
  );
}
