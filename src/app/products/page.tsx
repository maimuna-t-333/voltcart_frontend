'use client';
import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { SlidersHorizontal, X, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import PageTransition from '@/components/layout/PageTransition';
import { useProducts } from '@/hooks/useProducts';

const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp: Variants  = {
  hidden: { opacity: 0, y: 22, scale: 0.97 },
  show:   { opacity: 1, y: 0,  scale: 1,    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

const sortOptions = [
  { value: '',           label: 'Recommended'      },
  { value: 'newest',     label: 'Newest'           },
  { value: 'price_asc',  label: 'Price ↑'          },
  { value: 'price_desc', label: 'Price ↓'          },
  { value: 'rating',     label: 'Top Rated'        },
  { value: 'bestseller', label: 'Best Sellers'     },
];

const CATS = [
  { label: 'All',         value: '',            icon: '⚡', c1: '#6366f1', c2: '#8b5cf6' },
  { label: 'Smartphones', value: 'Smartphones', icon: '📱', c1: '#6366f1', c2: '#8b5cf6' },
  { label: 'Laptops',     value: 'Laptops',     icon: '💻', c1: '#8b5cf6', c2: '#a855f7' },
  { label: 'Headphones',  value: 'Headphones',  icon: '🎧', c1: '#a855f7', c2: '#d946ef' },
  { label: 'Tablets',     value: 'Tablets',     icon: '📟', c1: '#06b6d4', c2: '#0891b2' },
  { label: 'Wearables',   value: 'Wearables',   icon: '⌚', c1: '#d97706', c2: '#f59e0b' },
  { label: 'Gaming',      value: 'Gaming',      icon: '🎮', c1: '#dc2626', c2: '#ef4444' },
  { label: 'Accessories', value: 'Accessories', icon: '🖱️', c1: '#059669', c2: '#10b981' },
  { label: 'Smart Home',  value: 'Smart Home',  icon: '🏠', c1: '#2563eb', c2: '#3b82f6' },
];

function ProductsContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const pillsRef = useRef<HTMLDivElement>(null);

  const category = searchParams.get('category') || '';
  const search   = searchParams.get('search')   || '';
  const sort     = searchParams.get('sort')     || '';
  const page     = Number(searchParams.get('page')) || 1;

  const { data, isLoading, isError, refetch } = useProducts({ category, search, sort, page, limit: 12 });

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value); else params.delete(key);
    if (key !== 'page') params.delete('page');
    router.push(`/products?${params.toString()}`);
  };

  const currentSort = sortOptions.find(o => o.value === sort) || sortOptions[0];

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('category');
    params.delete('search');
    params.delete('page');
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className='relative min-h-screen' style={{ background: 'var(--bg)' }}>
      {/* bg glows */}
      <div aria-hidden className='pointer-events-none fixed inset-0 overflow-hidden'>
        <div className='absolute -top-32 left-1/4 w-[600px] h-[600px] rounded-full blur-[140px] opacity-20'
          style={{ background: 'rgba(99,102,241,1)' }} />
        <div className='absolute top-1/2 right-0 w-[400px] h-[400px] rounded-full blur-[120px] opacity-15'
          style={{ background: 'rgba(139,92,246,1)' }} />
      </div>
      <div className='absolute inset-0 hb-grid-overlay opacity-30' />

      <div className='relative z-10 max-w-7xl mx-auto px-4 sm:px-6'>

        {/* ── HERO HEADER ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className='pt-10 pb-6'
        >
          <div className='flex items-end justify-between gap-4 mb-6'>
            <div>
              <p className='text-[11px] font-bold tracking-[0.2em] uppercase mb-2'
                style={{ color: 'var(--accent)' }}>
                VoltCart Store
              </p>
              <h1 className='text-[32px] sm:text-[40px] font-bold tracking-tight leading-none'
                style={{ color: 'var(--tx)' }}>
                {category || (search ? `"${search}"` : 'All Products')}
              </h1>
              {data && (
                <p className='text-[13px] mt-2' style={{ color: 'var(--tx2)' }}>
                  {data.total} product{data.total !== 1 ? 's' : ''}
                  {category && ` in ${category}`}
                </p>
              )}
            </div>

            {/* sort */}
            <div className='relative shrink-0' ref={sortRef}>
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className='flex items-center gap-2 rounded-xl px-4 h-10 text-[13px] font-medium transition-all duration-200'
                style={{ color: 'var(--tx2)', background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <span className='hidden sm:inline'>{currentSort.label}</span>
                <span className='sm:hidden'>
                  <SlidersHorizontal size={14} strokeWidth={2} />
                </span>
                <motion.span animate={{ rotate: sortOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown size={13} strokeWidth={2.5} />
                </motion.span>
              </button>
              <AnimatePresence>
                {sortOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0,  scale: 1    }}
                    exit={{    opacity: 0, y: -6, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className='absolute right-0 mt-2 w-[180px] rounded-2xl z-30 overflow-hidden py-1.5'
                    style={{ background: 'var(--card)', border: '1px solid var(--card-bdr)',
                      boxShadow: '0 16px 48px rgba(0,0,0,0.18)', backdropFilter: 'blur(20px)' }}
                  >
                    {sortOptions.map(o => (
                      <button key={o.value}
                        onClick={() => { updateParam('sort', o.value); setSortOpen(false); }}
                        className='w-full text-left px-4 py-2.5 text-[13px] transition-colors duration-100 flex items-center justify-between gap-2'
                        style={{ color: sort === o.value ? 'var(--accent)' : 'var(--tx)',
                          background: sort === o.value ? 'var(--accent-dim)' : 'transparent',
                          fontWeight: sort === o.value ? 600 : 400 }}
                      >
                        {o.label}
                        {sort === o.value && (
                          <span className='w-1.5 h-1.5 rounded-full shrink-0' style={{ background: 'var(--accent)' }} />
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ── CATEGORY PILLS ── */}
          <div ref={pillsRef} className='flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'>
            {CATS.map((cat, i) => {
              const active = cat.value === category;
              return (
                <motion.button
                  key={cat.value}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                  onClick={() => updateParam('category', cat.value)}
                  className='flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium whitespace-nowrap shrink-0 transition-all duration-200'
                  style={active ? {
                    background: `linear-gradient(135deg, ${cat.c1}, ${cat.c2})`,
                    color: '#fff',
                    boxShadow: `0 4px 16px ${cat.c1}66`,
                    border: '1px solid transparent',
                  } : {
                    background: 'var(--surface)',
                    color: 'var(--tx2)',
                    border: '1px solid var(--border)',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.background = `${cat.c1}22`;
                      (e.currentTarget as HTMLElement).style.borderColor = `${cat.c1}44`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.background = 'var(--surface)';
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                    }
                  }}
                >
                  {cat.label}
                </motion.button>
              );
            })}
          </div>

          {/* search pill */}
          <AnimatePresence>
            {search && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }} className='mt-3 overflow-hidden'
              >
                <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12.5px] font-medium'
                  style={{ color: 'var(--accent)', background: 'var(--accent-dim)', border: '1px solid rgba(99,102,241,0.2)' }}>
                  🔍 &ldquo;{search}&rdquo;
                  <button onClick={() => updateParam('search', '')} className='hover:opacity-70 transition-opacity'>
                    <X size={12} strokeWidth={2.5} />
                  </button>
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── GRID ── */}
        <div className='pb-16'>
          {isError ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className='flex flex-col items-center justify-center py-32 text-center'>
              <div className='text-5xl mb-4'>⚠️</div>
              <h3 className='text-[18px] font-bold mb-2' style={{ color: 'var(--tx)' }}>Something went wrong</h3>
              <p className='text-[13px] mb-6' style={{ color: 'var(--tx2)' }}>
                Couldn&apos;t load products. Please try again.
              </p>
              <button onClick={() => refetch()}
                className='px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white'
                style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', boxShadow: '0 4px 16px rgba(99,102,241,0.3)' }}>
                Retry
              </button>
            </motion.div>
          ) : isLoading && !data ? (
            <motion.div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5'
              variants={stagger} initial='hidden' animate='show'>
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.div key={i} variants={fadeUp}><ProductCardSkeleton /></motion.div>
              ))}
            </motion.div>
          ) : data?.products.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className='flex flex-col items-center justify-center py-32 text-center'>
              <div className='text-5xl mb-4'>🔍</div>
              <h3 className='text-[18px] font-bold mb-2' style={{ color: 'var(--tx)' }}>Nothing here</h3>
              <p className='text-[13px] mb-6' style={{ color: 'var(--tx2)' }}>
                Try a different category or search term
              </p>
              <button onClick={clearFilters}
                className='px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white'
                style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', boxShadow: '0 4px 16px rgba(99,102,241,0.3)' }}>
                Clear filters
              </button>
            </motion.div>
          ) : (
            <>
              <motion.div
                className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5'
                variants={stagger} initial='hidden' animate='show'
              >
                {data?.products.map(product => (
                  <motion.div key={product._id} variants={fadeUp}>
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>

              {/* pagination */}
              {data && data.pages > 1 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                  className='flex items-center justify-center gap-2 mt-14'>
                  <button onClick={() => updateParam('page', String(page - 1))} disabled={page <= 1}
                    className='flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 disabled:opacity-30'
                    style={{ color: 'var(--tx2)', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                    <ChevronLeft size={16} strokeWidth={2} />
                  </button>
                  {(() => {
                    const total = data.pages;
                    const current = page;
                    const pages: (number | '...')[] = [];
                    const addPage = (n: number) => { if (!pages.includes(n)) pages.push(n); };
                    addPage(1);
                    const rangeStart = Math.max(2, current - 1);
                    const rangeEnd = Math.min(total - 1, current + 1);
                    if (rangeStart > 2) pages.push('...');
                    for (let i = rangeStart; i <= rangeEnd; i++) addPage(i);
                    if (rangeEnd < total - 1) pages.push('...');
                    if (total > 1) addPage(total);
                    return pages.map((p, i) =>
                      p === '...' ? (
                        <span key={`e${i}`} className='w-6 text-center text-[13px]' style={{ color: 'var(--tx3)' }}>...</span>
                      ) : (
                        <button key={p} onClick={() => updateParam('page', String(p))}
                          className='w-10 h-10 rounded-xl text-[13px] font-semibold transition-all duration-200'
                          style={{
                            color: current === p ? '#fff' : 'var(--tx2)',
                            background: current === p ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'var(--surface)',
                            border: current === p ? 'none' : '1px solid var(--border)',
                            boxShadow: current === p ? '0 4px 14px rgba(99,102,241,0.35)' : 'none',
                          }}>
                          {p}
                        </button>
                      )
                    );
                  })()}
                  <button onClick={() => updateParam('page', String(page + 1))} disabled={page >= data.pages}
                    className='flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 disabled:opacity-30'
                    style={{ color: 'var(--tx2)', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                    <ChevronRight size={16} strokeWidth={2} />
                  </button>
                </motion.div>
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
      <Suspense fallback={
        <div className='min-h-screen flex items-center justify-center' style={{ background: 'var(--bg)' }}>
          <div className='w-6 h-6 rounded-full border-2 border-transparent animate-spin'
            style={{ borderTopColor: 'var(--accent)', borderRightColor: 'var(--accent)' }} />
        </div>
      }>
        <ProductsContent />
      </Suspense>
    </PageTransition>
  );
}
