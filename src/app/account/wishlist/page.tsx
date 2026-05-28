'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingCart, Trash2, ChevronRight, Sparkles } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';
import { useWishlistStore, type WishlistItem } from '@/store/wishlistStore';
import { useRequireAuth } from '@/hooks/useAuth';
import { formatPrice } from '@/lib/utils';
import { useState, useMemo, useRef, useEffect } from 'react';
import PageTransition from '@/components/layout/PageTransition';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Image from 'next/image';

const productColors = ['#6366f1','#8b5cf6','#ec4899','#f43f5e','#f97316','#eab308','#22c55e','#14b8a6','#06b6d4','#3b82f6'];

function hashColor(name: string) {
  const hash = name.split('').reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0);
  return productColors[Math.abs(hash) % productColors.length];
}

function CountUp({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<number>(null);
  useEffect(() => {
    const start = performance.now();
    const dur = 600;
    const from = display;
    const to = value;
    const tick = (now: number) => {
      const t = Math.min((now - start) / dur, 1);
      setDisplay(Math.round(from + (to - from) * (1 - Math.pow(1 - t, 3))));
      if (t < 1) ref.current = requestAnimationFrame(tick);
    };
    ref.current = requestAnimationFrame(tick);
    return () => { if (ref.current) cancelAnimationFrame(ref.current); };
  }, [value]);
  return <>{display}</>;
}

function SkeletonGrid() {
  return (
    <div className='grid grid-cols-2 gap-4'>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className='rounded-xl overflow-hidden animate-pulse' style={{ background: 'var(--card)', border: '1px solid var(--card-bdr)' }}>
          <div className='aspect-square' style={{ background: 'var(--border)' }} />
          <div className='p-3.5 space-y-2.5'>
            <div className='h-2.5 rounded w-1/3' style={{ background: 'var(--border)' }} />
            <div className='h-3.5 rounded w-4/5' style={{ background: 'var(--border)' }} />
            <div className='h-4 rounded w-1/4' style={{ background: 'var(--border)' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function WishlistPage() {
  const { user, isLoading: authLoading } = useRequireAuth();
  const { items: wishlist, removeFromWishlist, clearWishlist } = useWishlistStore();
  const addItem = useCartStore(s => s.addItem);
  const openCart = useUIStore(s => s.openCart);
  const [addingAll, setAddingAll] = useState(false);

  const total = useMemo(() => wishlist.reduce((s, i) => s + i.basePrice, 0), [wishlist]);

  if (authLoading) return (
    <PageTransition>
      <section className='min-h-screen' style={{ background: 'var(--bg)' }}>
        <div className='max-w-4xl mx-auto px-4 py-8 lg:py-12'>
          <div className='mb-7 animate-pulse'>
            <div className='h-3 rounded w-20 mb-3' style={{ background: 'var(--border)' }} />
            <div className='h-6 rounded w-32' style={{ background: 'var(--border)' }} />
          </div>
          <SkeletonGrid />
        </div>
      </section>
    </PageTransition>
  );

  if (!user) return null;

  const addToCart = (item: WishlistItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    addItem({
      productId: item._id,
      variantSku: item.variantSku,
      name: item.name,
      image: item.image,
      price: item.basePrice,
      quantity: 1,
    });
    openCart();
    toast.success(`${item.name} added to cart!`);
  };

  const addAllToCart = async () => {
    setAddingAll(true);
    wishlist.forEach(item => {
      addItem({
        productId: item._id,
        variantSku: item.variantSku,
        name: item.name,
        image: item.image,
        price: item.basePrice,
        quantity: 1,
      });
    });
    openCart();
    toast.success(`Added all ${wishlist.length} items to cart!`);
    setAddingAll(false);
  };

  return (
    <PageTransition>
      <section className='min-h-screen' style={{ background: 'var(--bg)' }}>
        <div className='fixed inset-0 pointer-events-none opacity-[0.015]'
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, var(--tx) 1px, transparent 0)',
            backgroundSize: '28px 28px',
          }}
        />

        <div className='relative z-10 max-w-4xl mx-auto px-4 py-8 lg:py-12 pb-28'>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className='mb-6'
          >
            <Link href='/account'
              className='inline-flex items-center gap-1 text-xs uppercase tracking-wider mb-3 transition-colors'
              style={{ color: 'var(--tx3)' }}
            >
              Account <ChevronRight size={10} strokeWidth={1.5} />{' '}
              <span style={{ color: 'var(--tx2)' }}>Wishlist</span>
            </Link>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <motion.div
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                  className='w-9 h-9 rounded-lg flex items-center justify-center'
                  style={{ background: 'var(--accent-dim)' }}>
                  <Heart size={18} style={{ color: 'var(--accent)' }} strokeWidth={1.5} />
                </motion.div>
                <h1 className='text-2xl font-extrabold tracking-tight' style={{ color: 'var(--tx)', fontFamily: 'var(--font-family-display)' }}>
                  Saved Items
                </h1>
              </div>
              {wishlist.length > 0 && (
                <button onClick={() => { clearWishlist(); toast.success('Wishlist cleared'); }}
                  className='text-xs font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all'
                  style={{ color: 'var(--tx3)', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <Trash2 size={11} strokeWidth={1.5} />
                  Clear All
                </button>
              )}
            </div>
          </motion.div>

          {wishlist.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className='text-center py-20'
            >
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                className='w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5'
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <Heart size={32} style={{ color: 'var(--tx3)' }} strokeWidth={1.5} />
              </motion.div>
              <h2 className='text-lg font-bold mb-1' style={{ color: 'var(--tx)' }}>Nothing saved yet</h2>
              <p className='text-sm mb-6' style={{ color: 'var(--tx2)' }}>Save products you love and find them here</p>
              <Link href='/products'
                className='inline-flex items-center gap-2 font-semibold px-5 py-2.5 rounded-xl text-white transition-all text-sm'
                style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}
              >
                Browse Products
              </Link>
            </motion.div>
          ) : (
            <>
              <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
                <AnimatePresence mode='popLayout'>
                  {wishlist.map((item, i) => {
                    const accent = hashColor(item.name || '');
                    const hasDiscount = item.comparePrice && item.comparePrice > item.basePrice;
                    const discountPct = hasDiscount ? Math.round((1 - item.basePrice / item.comparePrice!) * 100) : 0;
                    return (
                      <motion.div
                        key={item._id}
                        layout
                        initial={{ opacity: 0, y: 16, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.18 } }}
                        transition={{ delay: i * 0.035, type: 'spring', stiffness: 200, damping: 24 }}
                        className='group relative rounded-xl overflow-hidden transition-all duration-200'
                        style={{
                          background: 'var(--card)',
                          border: '1px solid var(--card-bdr)',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = `${accent}35`;
                          e.currentTarget.style.boxShadow = `0 0 0 1px ${accent}12, 0 8px 24px ${accent}06`;
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = 'var(--card-bdr)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <Link href={`/products/${item.slug}`} className='block relative'>
                          {hasDiscount && (
                            <div className='absolute top-2.5 left-2.5 z-10 flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-extrabold'
                              style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)', color: '#fff' }}>
                              <Sparkles size={8} strokeWidth={2} />
                              -{discountPct}%
                            </div>
                          )}

                          {/* Square image */}
                          <div className='aspect-square overflow-hidden'>
                            {item.image ? (
                              <Image src={item.image} alt='' width={400} height={400}
                                className='object-cover w-full h-full transition-all duration-500 group-hover:scale-105' />
                            ) : (
                              <div className='w-full h-full flex items-center justify-center text-3xl font-bold transition-transform duration-500 group-hover:scale-105'
                                style={{ background: `linear-gradient(135deg, ${accent}10, ${accent}04)`, color: accent }}>
                                {(item.name || '?')[0].toUpperCase()}
                              </div>
                            )}
                          </div>

                          {/* Hover overlay */}
                          <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2'
                            style={{ backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)' }}>
                            <button
                              onClick={(e) => { e.preventDefault(); addToCart(item, e); }}
                              className='flex items-center gap-1.5 font-semibold px-4 py-2 rounded-lg text-white text-xs transition-all duration-200 active:scale-95'
                              style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}
                            >
                              <ShoppingCart size={12} strokeWidth={1.5} />
                              Add to Cart
                            </button>
                            <button
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeFromWishlist(item._id); }}
                              className='w-8 h-8 rounded-lg flex items-center justify-center bg-white/15 backdrop-blur-sm transition-all duration-200 hover:bg-white/25 hover:scale-105'
                            >
                              <Trash2 size={12} strokeWidth={1.5} className='text-white' />
                            </button>
                          </div>
                        </Link>

                        {/* Info strip below */}
                        <div className='p-2.5'>
                          {item.brand && (
                            <span className='text-[8px] font-semibold uppercase tracking-[0.12em]' style={{ color: 'var(--tx3)' }}>{item.brand}</span>
                          )}
                          <Link href={`/products/${item.slug}`}>
                            <h3 className='font-semibold text-[11px] leading-snug mt-0.5 transition-colors hover:opacity-70 line-clamp-2' style={{ color: 'var(--tx)' }}>
                              {item.name}
                            </h3>
                          </Link>
                          <div className='flex items-baseline gap-1.5 mt-1'>
                            <span className='font-extrabold text-xs' style={{ color: 'var(--tx)' }}>{formatPrice(item.basePrice)}</span>
                            {hasDiscount && (
                              <span className='text-[9px] line-through' style={{ color: 'var(--tx3)' }}>{formatPrice(item.comparePrice!)}</span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Floating bar */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className='fixed bottom-6 left-1/2 -translate-x-1/2 z-20 rounded-2xl px-5 py-3 flex items-center gap-4 shadow-2xl backdrop-blur-xl border'
                style={{
                  background: 'var(--card)',
                  borderColor: 'var(--card-bdr)',
                  boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
                }}
              >
                <div className='flex items-center gap-2.5'>
                  <Heart size={15} style={{ color: 'var(--accent)' }} strokeWidth={1.5} />
                  <span className='text-sm font-semibold' style={{ color: 'var(--tx)' }}>
                    <CountUp value={wishlist.length} /> {wishlist.length === 1 ? 'item' : 'items'}
                  </span>
                  <span className='text-xs font-medium px-2 py-0.5 rounded-full' style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>
                    {formatPrice(total)}
                  </span>
                </div>
                <div className='w-px h-6' style={{ background: 'var(--border)' }} />
                <button
                  onClick={addAllToCart}
                  disabled={addingAll}
                  className='flex items-center gap-2 font-bold px-5 py-2 rounded-xl text-white transition-all duration-200 text-sm whitespace-nowrap disabled:opacity-50 active:scale-[0.98]'
                  style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}
                >
                  <ShoppingCart size={14} strokeWidth={1.5} />
                  {addingAll ? 'Adding...' : 'Add All to Cart'}
                </button>
              </motion.div>
            </>
          )}
        </div>
      </section>
    </PageTransition>
  );
}
