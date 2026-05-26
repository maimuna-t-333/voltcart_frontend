'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, TrendingUp, Star } from 'lucide-react';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { useProducts } from '@/hooks/useProducts';

export default function BestSellers() {
  const { data, isLoading } = useProducts({ limit: 4, sort: 'bestseller' });
  const products = data?.products ?? [];

  return (
    <section className='relative overflow-hidden border-y border-neutral-100 dark:border-white/6'>
      <div className='absolute inset-0 bg-[#f2f2f8] dark:bg-[#08080e] transition-colors duration-400' />

      <div className='relative z-10 mx-auto max-w-300 px-7 py-16 sm:py-20'>
        {/* heading */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className='flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6'
        >
          <div>
            <p className='text-[12.5px] font-semibold tracking-[0.2em] uppercase text-[#d97706] dark:text-[#f59e0b] mb-3'>
              Top Rated
            </p>
            <h2 className='text-[26px] sm:text-[30px] font-bold tracking-tight text-neutral-800 dark:text-white/85'>
              Best{' '}
              <span className='text-transparent bg-clip-text bg-linear-to-r from-[#f59e0b] to-[#d97706]'>
                Selling Products
              </span>
            </h2>
          </div>
          <Link
            href='/products?sort=bestseller'
            className='group flex items-center gap-2 text-[13px] font-semibold text-[#d97706] dark:text-[#f59e0b] shrink-0 transition-colors duration-200 hover:text-[#b45309]'
          >
            See More
            <ArrowUpRight
              size={15}
              strokeWidth={2.5}
              className='transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5'
            />
          </Link>
        </motion.div>

        {isLoading ? (
          <div className='space-y-4'>
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className='text-[14px] text-neutral-400 dark:text-white/35'>
            No best sellers yet.
          </p>
        ) : (
          <div className='divide-y divide-neutral-200 dark:divide-white/[0.07]'>
            {products.map((product, i) => {
              const rankColors = ['#f59e0b', '#94a3b8', '#cd7f32', '#6366f1'];
              const barWidths = [100, 82, 68, 55];
              return (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link href={`/products/${product.slug}`}>
                    <motion.div
                      whileHover={{ x: 4 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      className='group relative flex items-center gap-5 sm:gap-8 py-4 sm:py-5 px-1 -mx-1 rounded-lg transition-colors duration-200 hover:bg-vc-accent/2 dark:hover:bg-white/2'
                    >
                      {/* rank */}
                      <div className='flex items-center justify-center w-10 sm:w-12 shrink-0'>
                        <span
                          className='text-[22px] sm:text-[26px] font-bold transition-colors duration-300'
                          style={{ color: rankColors[i] }}
                        >
                          {String(i + 1).padStart(2, '0')}
                        </span>
                      </div>

                      {/* image thumbnail */}
                      {product.variants[0]?.images[0] && (
                        <div className='w-14 sm:w-16 lg:w-0 lg:group-hover:w-16 transition-all duration-400 overflow-hidden rounded-lg shrink-0'>
                          <div className='relative w-14 sm:w-16 h-14 sm:h-16'>
                            <Image
                              src={product.variants[0].images[0]}
                              alt={product.name}
                              fill
                              sizes='64px'
                              className='object-cover'
                            />
                          </div>
                        </div>
                      )}

                      {/* info */}
                      <div className='flex-1 min-w-0'>
                        <p className='text-[11px] font-semibold tracking-wider uppercase text-neutral-400 dark:text-white/35 truncate'>
                          {product.brand}
                        </p>
                        <p className='text-[15px] sm:text-[17px] font-bold leading-snug text-neutral-800 dark:text-white/90 truncate transition-colors duration-200 group-hover:text-vc-accent dark:group-hover:text-[#818cf8]'>
                          {product.name}
                        </p>
                      </div>

                      {/* price + stat */}
                      <div className='text-right shrink-0'>
                        <div className='flex items-baseline gap-1.5 justify-end'>
                          <span className='text-[17px] sm:text-[19px] font-bold text-neutral-900 dark:text-white/90'>
                            ${product.basePrice}
                          </span>
                          {product.comparePrice && (
                            <span className='text-[11px] text-neutral-400 dark:text-white/30 line-through'>
                              ${product.comparePrice}
                            </span>
                          )}
                        </div>
                        <div className='flex items-center gap-1 justify-end mt-0.5'>
                          {product.soldCount > 0 ? (
                            <>
                              <TrendingUp size={11} strokeWidth={2} className='text-[#f59e0b]' />
                              <span className='text-[11px] text-neutral-400 dark:text-white/35'>
                                {product.soldCount} sold
                              </span>
                            </>
                          ) : (
                            <>
                              <Star size={11} strokeWidth={1.5} className='fill-amber-400 text-amber-400' />
                              <span className='text-[11px] text-neutral-400 dark:text-white/35'>
                                {product.avgRating?.toFixed(1) ?? '0.0'}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* thin bar */}
                      <div
                        className='absolute bottom-0 left-0 h-0.5 rounded-full transition-all duration-500 ease-out'
                        style={{
                          width: `${barWidths[i]}%`,
                          background: `linear-gradient(90deg, ${rankColors[i]}, ${rankColors[i]}44)`,
                        }}
                      />
                    </motion.div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
