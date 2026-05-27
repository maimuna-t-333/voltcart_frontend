'use client';
import { useProducts } from '@/hooks/useProducts';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import {
  ShoppingCart, Heart, Star, Truck, Shield, RotateCcw,
  Share2, Link as LinkIcon, Frown,
  Cpu, Battery, HardDrive, Eye, Zap, Gem,
  ChevronRight, ChevronLeft, ArrowUpRight,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import api from '@/lib/axios';
import type { Product } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';
import { useRecentlyViewedStore } from '@/store/recentlyViewedStore';
import { useWishlistStore, type WishlistItem } from '@/store/wishlistStore';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import toast from 'react-hot-toast';
import { formatPrice } from '@/lib/utils';
import ProductCard from '@/components/product/ProductCard';
import { useReviews } from '@/hooks/useReviews';
import ReviewList from '@/components/review/ReviewList';
import ReviewForm from '@/components/review/ReviewForm';

function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className='flex items-center gap-0.5'>
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.06, duration: 0.3, ease: 'easeOut' }}
        >
          <Star
            size={size}
            strokeWidth={1.5}
            className={i < Math.floor(rating) ? 'fill-amber-400 text-amber-400' : 'text-neutral-200 dark:text-white/10'}
          />
        </motion.span>
      ))}
    </div>
  );
}

function SpecBar({ label, value, max = 100 }: { label: string; value: number; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div ref={ref} className='space-y-1.5'>
      <div className='flex justify-between text-sm'>
        <span className='text-neutral-400 dark:text-white/40 font-medium'>{label}</span>
        <span className='text-white font-semibold'>{value}/{max}</span>
      </div>
      <div className='h-1.5 rounded-full bg-white/5 overflow-hidden'>
        <motion.div
          initial={{ width: 0 }}
          animate={inView ? { width: `${pct}%` } : {}}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
          className='h-full rounded-full bg-gradient-to-r from-vc-accent to-[#a78bfa]'
        />
      </div>
    </div>
  );
}

function SpecCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className='flex items-center gap-3 rounded-xl px-4 py-3.5'
      style={{ background: 'var(--spec-bg)', border: '1px solid var(--spec-bdr)' }}
    >
      <div className='w-9 h-9 rounded-lg flex items-center justify-center shrink-0'
        style={{ background: 'var(--accent-dim)' }}>
        <Icon size={16} style={{ color: 'var(--accent)' }} strokeWidth={1.5} />
      </div>
      <div className='min-w-0'>
        <p className='text-xs font-medium truncate' style={{ color: 'var(--tx2)' }}>{label}</p>
        <p className='text-sm font-bold truncate' style={{ color: 'var(--tx)' }}>{value}</p>
      </div>
    </motion.div>
  );
}

function ImageZoom({ src, alt, discount }: { src: string; alt: string; discount?: number }) {
  const [zoom, setZoom] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const imgRef = useRef<HTMLDivElement>(null);

  const handleMouse = useCallback((e: React.MouseEvent) => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPos({ x, y });
    setTilt({
      x: (e.clientX - rect.left) / rect.width - 0.5,
      y: (e.clientY - rect.top) / rect.height - 0.5,
    });
  }, []);

  const reset = useCallback(() => {
    setZoom(false);
    setTilt({ x: 0, y: 0 });
  }, []);

  return (
    <div className='relative'>
      <div
        ref={imgRef}
        className='relative aspect-square rounded-3xl overflow-hidden cursor-crosshair'
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          transform: `perspective(1200px) rotateX(${tilt.y * -6}deg) rotateY(${tilt.x * 6}deg)`,
          transition: zoom ? 'none' : 'transform 0.3s ease-out',
        }}
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={reset}
        onMouseMove={handleMouse}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes='(max-width: 768px) 100vw, 50vw'
          className='object-cover transition-transform duration-200'
          style={{
            transform: zoom ? `scale(1.8)` : 'scale(1)',
            transformOrigin: `${pos.x}% ${pos.y}%`,
          }}
          priority
        />

        <div className='absolute inset-0 pointer-events-none'
          style={{
            background: 'radial-gradient(ellipse at 40% 30%, rgba(99,102,241,0.06) 0%, transparent 60%)',
            mixBlendMode: 'screen',
          }}
        />
      </div>

      {discount && (
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className='absolute -top-2 -right-2 z-20 text-xs font-bold px-3 py-1.5 rounded-full text-white shadow-lg'
          style={{
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            boxShadow: '0 4px 16px rgba(239,68,68,0.35)',
          }}
        >
          -{discount}% OFF
        </motion.span>
      )}

      {/* Floating spec badges */}
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className='absolute bottom-4 left-4 z-10 rounded-xl px-3 py-2 backdrop-blur-xl'
        style={{
          background: 'var(--card)',
          border: '1px solid var(--card-bdr)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        }}
      >
        <p className='text-[10px] font-medium' style={{ color: 'var(--tx2)' }}>Chip</p>
        <p className='text-sm font-bold' style={{ color: 'var(--tx)' }}>M3 Pro</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.7, duration: 0.4 }}
        className='absolute bottom-4 right-4 z-10 rounded-xl px-3 py-2 backdrop-blur-xl'
        style={{
          background: 'var(--card)',
          border: '1px solid var(--card-bdr)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        }}
      >
        <p className='text-[10px] font-medium' style={{ color: 'var(--tx2)' }}>Display</p>
        <p className='text-sm font-bold' style={{ color: 'var(--tx)' }}>14&quot;</p>
      </motion.div>
    </div>
  );
}

function RecentlyViewed() {
  const items = useRecentlyViewedStore(s => s.items);
  const scrollRef = useRef<HTMLDivElement>(null);

  if (items.length === 0) return null;

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -340 : 340, behavior: 'smooth' });
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      className='max-w-7xl mx-auto px-4 py-10'
    >
      <div className='flex items-center justify-between mb-6'>
        <h2 className='text-lg font-bold' style={{ color: 'var(--tx)' }}>
          <span className='text-transparent bg-clip-text bg-gradient-to-r from-vc-accent to-vc-accent/50'>Recently</span> Viewed
        </h2>
        <div className='flex gap-1'>
          <button onClick={() => scroll('left')} className='w-8 h-8 rounded-full flex items-center justify-center transition-colors' style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <ChevronLeft size={14} style={{ color: 'var(--tx2)' }} />
          </button>
          <button onClick={() => scroll('right')} className='w-8 h-8 rounded-full flex items-center justify-center transition-colors' style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <ChevronRight size={14} style={{ color: 'var(--tx2)' }} />
          </button>
        </div>
      </div>
      <div ref={scrollRef} className='flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [-webkit-overflow-scrolling:touch]'>
        {items.map(item => (
          <Link key={item._id} href={`/products/${item.slug}`} className='group shrink-0 w-[140px]'>
            <div className='aspect-square rounded-xl overflow-hidden mb-2 relative' style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              {item.image ? (
                <Image src={item.image} alt={item.name} width={140} height={140} className='w-full h-full object-cover transition-transform duration-300 group-hover:scale-105' />
              ) : (
                <div className='w-full h-full flex items-center justify-center' style={{ color: 'var(--tx3)' }}>📦</div>
              )}
            </div>
            <p className='text-[11px] font-medium truncate' style={{ color: 'var(--tx2)' }}>{item.brand}</p>
            <p className='text-[13px] font-semibold truncate transition-colors' style={{ color: 'var(--tx)' }}>{item.name}</p>
            <p className='text-[13px] font-bold' style={{ color: 'var(--accent)' }}>{formatPrice(item.basePrice)}</p>
          </Link>
        ))}
      </div>
    </motion.section>
  );
}

function RelatedProducts({ category, currentSlug }: { category: string; currentSlug: string }) {
  const { data } = useProducts({ category, limit: 6 });
  const related = data?.products.filter(p => p.slug !== currentSlug) || [];
  const scrollRef = useRef<HTMLDivElement>(null);

  if (related.length === 0) return null;

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -340 : 340, behavior: 'smooth' });
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      className='max-w-7xl mx-auto px-4 py-10 border-t'
      style={{ borderColor: 'var(--border)' }}
    >
      <div className='flex items-center justify-between mb-6'>
        <h2 className='text-lg font-bold' style={{ color: 'var(--tx)' }}>
          More from <span className='text-vc-accent'>{category}</span>
        </h2>
        <Link href={`/products?category=${category}`} className='flex items-center gap-1 text-sm font-semibold' style={{ color: 'var(--accent)' }}>
          View All <ArrowUpRight size={14} strokeWidth={2.5} />
        </Link>
      </div>
      <div ref={scrollRef} className='flex gap-5 overflow-x-auto pb-2 [scrollbar-width:none] [-webkit-overflow-scrolling:touch]'>
        {related.map(product => (
          <div key={product._id} className='shrink-0 w-[220px] sm:w-[260px]'>
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </motion.section>
  );
}

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');

  const addItem = useCartStore(s => s.addItem);
  const openCart = useUIStore(s => s.openCart);
  const addRecent = useRecentlyViewedStore(s => s.addItem);
  const wishlistItems = useWishlistStore(s => s.items);
  const toggleWishlist = useWishlistStore(s => s.toggleWishlist);

  const ctaRef = useRef<HTMLDivElement>(null);
  const ctaInView = useInView(ctaRef);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const heroRef = useRef<HTMLDivElement>(null);

  const productQuery = useQuery<Product>({
    queryKey: ['product', slug],
    queryFn: async () => {
      const { data } = await api.get(`/products/${slug}`);
      return data.data.product;
    },
  });

  const { scrollYProgress } = useScroll({ target: mounted && productQuery.data ? heroRef : undefined, offset: ['start start', 'end start'] });
  const imgParallax = useTransform(scrollYProgress, [0, 1], ['0%', '10%']);
  const heroFade = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const product = productQuery.data;
  const isLoading = productQuery.isLoading;

  const { data: reviews = [], isLoading: reviewsLoading } = useReviews(slug);

  useEffect(() => {
    if (product) {
      addRecent({
        _id: product._id,
        slug: product.slug,
        name: product.name,
        brand: product.brand,
        basePrice: product.basePrice,
        image: product.variants[0]?.images[0] || '',
      });
    }
  }, [product, addRecent]);

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: product?.name, url }); } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied!');
    }
  }, [product?.name]);

  const handleCopyLink = useCallback(async () => {
    await navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied!');
  }, []);

  const isInWishlist = product ? wishlistItems.some(i => i._id === product._id) : false;

  const handleToggleWishlist = useCallback(() => {
    if (!product) return;
    const item: WishlistItem = {
      _id: product._id,
      name: product.name,
      brand: product.brand,
      slug: product.slug,
      basePrice: product.basePrice,
      comparePrice: product.comparePrice,
      variantSku: product.variants[selectedVariant].sku,
      image: product.variants[selectedVariant].images[selectedImage] || product.variants[selectedVariant].images[0],
    };
    toggleWishlist(item);
  }, [product, selectedVariant, selectedImage, toggleWishlist]);

  if (isLoading) return (
    <div className='min-h-screen flex items-center justify-center' style={{ background: 'var(--bg)' }}>
      <div className='max-w-7xl mx-auto px-4 py-8 w-full'>
        <div className='grid md:grid-cols-2 gap-12'>
          <ProductCardSkeleton />
          <div className='space-y-4'>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className='h-8 rounded-lg animate-pulse' style={{ background: 'var(--surface)' }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div className='min-h-screen flex items-center justify-center' style={{ background: 'var(--bg)' }}>
      <div className='text-center'>
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
          <Frown size={64} className='mx-auto mb-4' style={{ color: 'var(--tx3)' }} />
        </motion.div>
        <h2 className='text-2xl font-bold mb-2' style={{ color: 'var(--tx)' }}>Product not found</h2>
        <Link href='/products' className='text-sm font-semibold transition-colors hover:underline' style={{ color: 'var(--accent)' }}>Back to products</Link>
      </div>
    </div>
  );

  const variant = product.variants[selectedVariant];
  const images = variant.images.length > 0 ? variant.images : [null];
  const discount = product.comparePrice ? Math.round((1 - product.basePrice / product.comparePrice) * 100) : 0;

  const handleVariantChange = (i: number) => {
    setSelectedVariant(i);
    setSelectedImage(0);
  };

  const handleAddToCart = () => {
    addItem({
      productId: product._id,
      variantSku: variant.sku,
      name: product.name,
      image: variant.images[0] || '',
      price: variant.price,
      quantity: 1,
    });
    openCart();
    toast.success('Added to cart!');
  };

  return (
    <>
      {/* ═══════════ HERO SECTION ═══════════ */}
      <section
        ref={heroRef}
        className='relative overflow-hidden transition-colors duration-400'
        style={{ background: 'var(--bg)' }}
      >
        {/* Background effects */}
        <div className='absolute inset-0 pointer-events-none z-0' aria-hidden>
          <div className='hb-grid-overlay absolute inset-0' />
          <div
            className='absolute rounded-full blur-[120px] pointer-events-none w-[600px] h-[500px] -top-[200px] -left-[200px]'
            style={{ background: 'var(--accent-glow)' }}
          />
          <div
            className='absolute rounded-full blur-[100px] pointer-events-none w-[400px] h-[400px] -bottom-[100px] right-0'
            style={{ background: 'rgba(139,92,246,0.1)' }}
          />
        </div>

        <div className='relative z-10 max-w-7xl mx-auto px-4 py-8 lg:py-12'>
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className='flex items-center gap-1.5 sm:gap-2 text-xs font-medium mb-8 flex-wrap'
            style={{ color: 'var(--tx2)' }}
          >
            <Link href='/' className='hover:text-vc-accent transition-colors shrink-0'>Home</Link>
            <ChevronRight size={12} strokeWidth={2} className='shrink-0' />
            <Link href='/products' className='hover:text-vc-accent transition-colors shrink-0'>Products</Link>
            <ChevronRight size={12} strokeWidth={2} className='shrink-0' />
            <Link href={`/products?category=${product.category}`} className='hover:text-vc-accent transition-colors truncate max-w-[100px] sm:max-w-none'>{product.category}</Link>
            <ChevronRight size={12} strokeWidth={2} className='shrink-0' />
            <span className='font-semibold truncate max-w-[120px] sm:max-w-[200px]' style={{ color: 'var(--tx)' }}>{product.name}</span>
          </motion.div>

          <div className='grid lg:grid-cols-2 gap-8 lg:gap-14'>
            {/* ═══ LEFT — Product Showcase ═══ */}
            <motion.div style={{ y: imgParallax }}>
              <div className='relative'>
                {images[selectedImage] ? (
                  <ImageZoom src={images[selectedImage]!} alt={product.name} discount={discount} />
                ) : (
                  <div className='relative aspect-square rounded-3xl flex items-center justify-center text-6xl'
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                    📦
                  </div>
                )}

                {/* Thumbnails */}
                {images.length > 1 && (
                  <div className='flex gap-2 mt-4'>
                    {images.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedImage(i)}
                        aria-label={`Product image ${i + 1}`}
                        className='relative w-14 h-14 rounded-xl overflow-hidden border-2 transition-all'
                        style={{
                          borderColor: selectedImage === i ? 'var(--accent)' : 'var(--border)',
                          background: 'var(--surface)',
                        }}
                      >
                        {img ? (
                          <Image src={img} alt='' width={56} height={56} className='object-cover w-full h-full' />
                        ) : (
                          <div className='w-full h-full' style={{ background: 'var(--surface)' }} />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* ═══ RIGHT — Product Info ═══ */}
            <motion.div
              style={{ opacity: heroFade }}
              className='flex flex-col'
            >
              <div
                className='rounded-3xl p-6 lg:p-8 backdrop-blur-xl flex-1 flex flex-col'
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--card-bdr)',
                  boxShadow: '0 8px 40px rgba(0,0,0,0.06)',
                }}
              >
                {/* Brand */}
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className='text-xs font-bold tracking-[0.15em] uppercase mb-2'
                  style={{ color: 'var(--accent)' }}
                >
                  {product.brand}
                </motion.p>

                {/* Name */}
                <motion.h1
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className='text-2xl lg:text-3xl font-extrabold tracking-tight leading-tight mb-4'
                  style={{ color: 'var(--tx)' }}
                >
                  {product.name}
                </motion.h1>

                {/* Rating */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className='flex items-center gap-3 mb-5'
                >
                  <StarRating rating={product.avgRating} size={16} />
                  <span className='text-xs font-medium' style={{ color: 'var(--tx2)' }}>
                    {product.avgRating.toFixed(1)} ({product.reviewCount} reviews)
                  </span>
                </motion.div>

                {/* Price */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className='flex items-baseline gap-3 mb-6'
                >
                  <span className='text-3xl lg:text-4xl font-extrabold' style={{ color: 'var(--tx)' }}>
                    {formatPrice(variant.price)}
                  </span>
                  {product.comparePrice && (
                    <span className='text-lg line-through' style={{ color: 'var(--price-old)' }}>
                      {formatPrice(product.comparePrice)}
                    </span>
                  )}
                  {discount > 0 && (
                    <span className='text-xs font-bold px-2.5 py-1 rounded-full bg-gradient-to-r from-[#ef4444] to-[#dc2626] text-white shadow-sm'>
                      Save {discount}%
                    </span>
                  )}
                </motion.div>

                {/* Variants */}
                {product.variants.length > 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className='mb-6'
                  >
                    <p className='text-xs font-semibold mb-2.5 uppercase tracking-wide' style={{ color: 'var(--tx2)' }}>
                      {product.variants[0].color ? 'Color' : 'Storage'}
                      <span className='font-normal normal-case ml-2' style={{ color: 'var(--tx)' }}>
                        — {variant.color || variant.storage}
                      </span>
                    </p>
                    <div className='flex flex-wrap gap-2'>
                      {product.variants.map((v, i) => {
                        const isColor = !!v.color;
                        return (
                          <motion.button
                            key={v.sku}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleVariantChange(i)}
                            className='relative px-4 py-2 rounded-xl text-sm font-medium transition-all'
                            style={{
                              background: selectedVariant === i
                                ? 'var(--accent-dim)'
                                : 'var(--surface)',
                              border: `1.5px solid ${
                                selectedVariant === i
                                  ? 'var(--accent)'
                                  : 'var(--border)'
                              }`,
                              color: selectedVariant === i
                                ? 'var(--accent)'
                                : 'var(--tx)',
                              boxShadow: selectedVariant === i
                                ? '0 0 20px var(--accent-glow)'
                                : 'none',
                            }}
                          >
                            {v.color || v.storage}
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Stock */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className='flex items-center gap-2 mb-6'
                >
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      variant.stock > 0 ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500'
                    }`}
                  />
                  <span className={`text-sm font-medium ${variant.stock > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {variant.stock > 10
                      ? 'In Stock'
                      : variant.stock > 0
                        ? `Only ${variant.stock} left!`
                        : 'Out of Stock'}
                  </span>
                </motion.div>

                {/* CTA + Wishlist */}
                <motion.div
                  ref={ctaRef}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className='flex gap-3 mb-6'
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddToCart}
                    disabled={variant.stock === 0}
                    className='flex-1 py-4 rounded-2xl text-white font-bold flex items-center justify-center gap-2 text-base transition-all'
                    style={{
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      boxShadow: '0 4px 20px rgba(99,102,241,0.35), 0 0 40px rgba(99,102,241,0.1)',
                    }}
                  >
                    <ShoppingCart size={20} strokeWidth={2} />
                    Add to Cart
                  </motion.button>
                  <button
                    onClick={handleToggleWishlist}
                    className='w-14 h-14 rounded-2xl flex items-center justify-center transition-all'
                    style={{
                      border: isInWishlist ? '1.5px solid #f87171' : '1.5px solid var(--border)',
                      color: isInWishlist ? '#f87171' : 'var(--tx2)',
                      background: isInWishlist ? 'rgba(248,113,113,0.08)' : 'transparent',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#f87171'; e.currentTarget.style.color = '#f87171'; }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = isInWishlist ? '#f87171' : 'var(--border)';
                      e.currentTarget.style.color = isInWishlist ? '#f87171' : 'var(--tx2)';
                    }}
                    aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <Heart size={20} strokeWidth={1.5} fill={isInWishlist ? '#f87171' : 'none'} />
                  </button>
                </motion.div>

                {/* Share */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                  className='flex items-center gap-2 mb-6'
                >
                  <span className='text-xs font-medium' style={{ color: 'var(--tx3)' }}>Share</span>
                  <button onClick={handleShare} aria-label='Share product'
                    className='w-8 h-8 rounded-full flex items-center justify-center transition-colors'
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--tx2)' }}>
                    <Share2 size={13} strokeWidth={1.5} />
                  </button>
                  <button onClick={handleCopyLink} aria-label='Copy link'
                    className='w-8 h-8 rounded-full flex items-center justify-center transition-colors'
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--tx2)' }}>
                    <LinkIcon size={13} strokeWidth={1.5} />
                  </button>
                </motion.div>

                {/* Perks */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className='grid grid-cols-1 sm:grid-cols-3 gap-2 mt-auto pt-6'
                  style={{ borderTop: '1px solid var(--border)' }}
                >
                  {[
                    { icon: Truck, text: 'Free Shipping' },
                    { icon: RotateCcw, text: '30-Day Returns' },
                    { icon: Shield, text: '2-Year Warranty' },
                  ].map(perk => (
                    <div key={perk.text} className='flex flex-col items-center gap-1.5 rounded-xl py-3 text-center'
                      style={{ background: 'var(--surface)' }}>
                      <perk.icon size={16} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
                      <span className='text-[10px] font-semibold leading-tight' style={{ color: 'var(--tx2)' }}>{perk.text}</span>
                    </div>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className='relative z-10 h-16 bg-gradient-to-b from-transparent' style={{ background: 'var(--bg)' }} />
      </section>

      {/* ═══════════ TECH SPECS SECTION ═══════════ */}
      <section
        className='relative overflow-hidden py-14 lg:py-18 transition-colors duration-400'
        style={{ background: 'var(--bg)' }}
      >
        <div className='absolute inset-0 pointer-events-none z-0' aria-hidden>
          <div
            className='absolute rounded-full blur-[120px] w-[500px] h-[400px] -top-[200px] -right-[200px]'
            style={{ background: 'var(--accent-glow)' }}
          />
        </div>

        <div className='relative z-10 max-w-7xl mx-auto px-4'>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className='flex items-center gap-3 mb-8'
          >
            <div className='w-8 h-8 rounded-lg flex items-center justify-center' style={{ background: 'var(--accent-dim)' }}>
              <Zap size={16} style={{ color: 'var(--accent)' }} strokeWidth={1.5} />
            </div>
            <div>
              <h2 className='text-lg font-bold' style={{ color: 'var(--tx)' }}>Technical Specifications</h2>
              <p className='text-xs' style={{ color: 'var(--tx2)' }}>Performance metrics & key features</p>
            </div>
          </motion.div>

          <div className='grid lg:grid-cols-2 gap-8'>
            {/* Spec cards grid */}
            <div className='grid grid-cols-2 gap-3'>
              {product.specs.slice(0, 6).map((spec, i) => {
                const icons = [Cpu, Battery, HardDrive, Eye, Gem, Zap];
                const IconComponent = icons[i % icons.length];
                return <SpecCard key={spec.key} icon={IconComponent} label={spec.key} value={spec.value} />;
              })}
            </div>

            {/* Performance bars */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className='rounded-2xl p-6 space-y-5'
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
              }}
            >
              <h3 className='text-sm font-bold flex items-center gap-2' style={{ color: 'var(--tx)' }}>
                <Gem size={15} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
                Performance Score
              </h3>
              <SpecBar label='Processing' value={92} />
              <SpecBar label='Graphics' value={88} />
              <SpecBar label='Memory Bandwidth' value={95} />
              <SpecBar label='Power Efficiency' value={90} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════ TABS SECTION ═══════════ */}
      <section
        className='py-10 transition-colors duration-400'
        style={{ background: 'var(--bg)', borderTop: '1px solid var(--border)' }}
      >
        <div className='max-w-7xl mx-auto px-4'>
          {/* Tab bar */}
          <div className='flex gap-1 mb-8 p-1 rounded-2xl w-fit overflow-x-auto [scrollbar-width:none]'
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            {(['description', 'specs', 'reviews'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className='px-5 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all'
                style={{
                  background: activeTab === tab ? 'var(--card)' : 'transparent',
                  color: activeTab === tab ? 'var(--accent)' : 'var(--tx2)',
                  boxShadow: activeTab === tab ? '0 1px 4px rgba(0,0,0,0.04)' : 'none',
                }}
              >
                {tab === 'description' ? 'Overview' : tab}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'description' ? (
              <div className='max-w-3xl'>
                <p className='text-base leading-relaxed' style={{ color: 'var(--tx2)' }}>{product.description}</p>
              </div>
            ) : activeTab === 'specs' ? (
              <div className='max-w-2xl space-y-0'>
                {product.specs.map(spec => (
                  <div key={spec.key} className='flex justify-between py-3.5' style={{ borderBottom: '1px solid var(--border)' }}>
                    <span className='text-sm font-medium' style={{ color: 'var(--tx2)' }}>{spec.key}</span>
                    <span className='text-sm font-semibold' style={{ color: 'var(--tx)' }}>{spec.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className='max-w-2xl space-y-8'>
                <ReviewList reviews={reviews} isLoading={reviewsLoading} />
                <ReviewForm slug={slug} />
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ═══════════ BOTTOM SECTIONS ═══════════ */}
      <section style={{ background: 'var(--bg)' }}>
        <RecentlyViewed />
        <div className='max-w-7xl mx-auto px-4'>
          <RelatedProducts category={product.category} currentSlug={product.slug} />
        </div>
      </section>

      {/* ═══════════ STICKY MOBILE BAR ═══════════ */}
      <motion.div
        initial={{ y: 80 }}
        animate={{ y: mounted && !ctaInView ? 0 : 80 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className='fixed bottom-0 left-0 right-0 z-50 lg:hidden'
        style={{
          background: 'var(--card)',
          borderTop: '1px solid var(--card-bdr)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 -8px 32px rgba(0,0,0,0.1)',
        }}
      >
        <div className='flex items-center justify-between gap-4 px-4 py-3'>
          <div className='min-w-0 flex items-center gap-3'>
            {images[0] && (
              <div className='w-10 h-10 rounded-lg overflow-hidden shrink-0'>
                <Image src={images[0]} alt='' width={40} height={40} className='object-cover w-full h-full' />
              </div>
            )}
            <div>
              <p className='text-sm font-semibold truncate max-w-[160px]' style={{ color: 'var(--tx)' }}>{product.name}</p>
              <p className='text-base font-bold' style={{ color: 'var(--accent)' }}>{formatPrice(variant.price)}</p>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleAddToCart}
            disabled={variant.stock === 0}
            className='shrink-0 px-5 py-3 rounded-xl text-white font-bold flex items-center gap-2 text-sm transition-all'
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
            }}
          >
            <ShoppingCart size={16} strokeWidth={2} />
            Add to Cart
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}
