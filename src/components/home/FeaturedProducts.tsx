'use client';
import { useRef, useState, useCallback } from'react';
import { motion, useMotionValue, useTransform } from'framer-motion';
import Image from'next/image';
import Link from'next/link';
import { ShoppingCart, Star, Heart, Zap, ArrowUpRight, ChevronLeft, ChevronRight } from'lucide-react';
import { ProductCardSkeleton } from'@/components/ui/Skeleton';
import { useFeaturedProducts } from'@/hooks/useProducts';
import { useCartStore } from'@/store/cartStore';
import { useUIStore } from'@/store/uiStore';
import { useWishlistStore } from'@/store/wishlistStore';
import { useAuthStore } from'@/store/authStore';
import toast from'react-hot-toast';

export default function FeaturedProducts() {
 const { data, isLoading } = useFeaturedProducts();
 const addItem = useCartStore((s) => s.addItem);
 const openCart = useUIStore((s) => s.openCart);
 const { toggleWishlist, isInWishlist } = useWishlistStore();
 const user = useAuthStore((s) => s.user);
 const scrollRef = useRef<HTMLDivElement>(null);
 const [activeDot, setActiveDot] = useState(0);
 const [hoveredPick, setHoveredPick] = useState<number | null>(null);
 const scrollProgress = useMotionValue(0);
 const glowX = useTransform(scrollProgress, [0, 1], ['0%','100%']);

 const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
 const el = e.currentTarget;
 const max = el.scrollWidth - el.clientWidth;
 if (max> 0) {
 const p = el.scrollLeft / max;
 scrollProgress.set(p);
 setActiveDot(Math.round(p * 4));
 }
 }, [scrollProgress]);

 const handleAddToCart = (product: any, e: React.MouseEvent) => {
 e.preventDefault();
 e.stopPropagation();
 const v = product.variants[0];
 addItem({
 productId: product._id,
 variantSku: v.sku,
 name: product.name,
 image: v.images[0] ||'',
 price: v.price,
 quantity: 1,
 });
 openCart();
 toast.success('Added to cart!');
 };

 const handleWishlist = (product: any, e: React.MouseEvent) => {
 e.preventDefault();
 e.stopPropagation();
 if (!user) {
 toast.error('Please log in to save items');
 return;
 }
 const v = product.variants[0];
 toggleWishlist({
 _id: product._id,
 name: product.name,
 brand: product.brand,
 slug: product.slug,
 basePrice: product.basePrice,
 comparePrice: product.comparePrice,
 variantSku: v?.sku ??'',
 image: v?.images[0] ??'',
 });
 };

 const scroll = (dir:'left' |'right') => {
 if (!scrollRef.current) return;
 const amount = dir ==='left' ? -340 : 340;
 scrollRef.current.scrollBy({ left: amount, behavior:'smooth' });
 };

 const hero = data?.[0];
 const picks = data?.slice(1) ?? [];
 const totalSlides = [hero, ...picks].filter(Boolean).length;

 return (
 <section className='relative overflow-hidden border-y border-neutral-100 bg-[#f2f2f8] transition-colors duration-400'>
 <div className='absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-vc-accent/35 to-transparent' />

 <motion.div
 className='absolute top-1/3 h-125 w-125 rounded-full pointer-events-none'
 style={{
 left: glowX,
 background:'radial-gradient(ellipse at center, color-mix(in srgb, #6366f1 7%, transparent) 0%, transparent 70%)',
 }}
 />
 <div className='absolute bottom-1/3 -right-32 size-100 rounded-full bg-vc-accent/4 blur-[140px]' />

 <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-125 rounded-full border border-vc-accent/3 pointer-events-none' />

 <div className='relative z-10 mx-auto max-w-300 px-7 py-16 sm:py-20'>
 <motion.div
 initial={{ opacity: 0, y: 14 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true }}
 transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
 className='flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8'
>
 <div>
 <p className='text-[12.5px] font-semibold tracking-[0.2em] uppercase text-vc-accent mb-3'>
 Editor&rsquo;s pick
 </p>
 <h2 className='text-[26px] sm:text-[30px] font-bold tracking-tight text-neutral-800'>
 Featured{''}
 <span className='text-transparent bg-clip-text bg-linear-to-r from-vc-accent to-vc-accent/50'>
 Products
 </span>
 </h2>
 <p className='text-[13.5px] text-neutral-400 mt-2'>
 Handpicked top gadgets for you
 </p>
 </div>
 <Link
 href='/products'
 className='group flex items-center gap-2 text-[13px] font-semibold shrink-0 transition-colors duration-200 text-vc-accent hover:text-[#4338ca]'
>
 View All
 <ArrowUpRight
 size={15}
 strokeWidth={2.5}
 className='transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5'
 />
 </Link>
 </motion.div>

 <div className='flex items-center gap-4 mb-8'>
 <div className='flex-1 h-px bg-linear-to-r from-transparent via-vc-accent/20 to-transparent' />
 <div className='size-1.5 rounded-full bg-vc-accent/30' />
 <div className='flex-1 h-px bg-linear-to-r from-transparent via-vc-accent/20 to-transparent' />
 </div>

 {isLoading ? (
 <div className='flex gap-5 overflow-hidden'>
 {Array.from({ length: 4 }).map((_, i) => (
 <div key={i} className='min-w-70 shrink-0'>
 <ProductCardSkeleton />
 </div>
 ))}
 </div>
 ) : (
 <div className='relative'>
 {/* scroll arrows */}
 <button
 onClick={() => scroll('left')}
 className='absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white border border-neutral-200 shadow-lg hidden items-center justify-center text-neutral-600 hover:text-vc-accent transition-all duration-200 hover:scale-105 active:scale-95 sm:flex'
 aria-label='Scroll left'
>
 <ChevronLeft size={18} strokeWidth={2} />
 </button>
 <button
 onClick={() => scroll('right')}
 className='absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white border border-neutral-200 shadow-lg hidden items-center justify-center text-neutral-600 hover:text-vc-accent transition-all duration-200 hover:scale-105 active:scale-95 sm:flex'
 aria-label='Scroll right'
>
 <ChevronRight size={18} strokeWidth={2} />
 </button>

 {/* shelf track */}
 <div className='relative transition-opacity duration-300'>
 {/* shelf shadow */}
 <div className='absolute bottom-0 inset-x-4 h-6 bg-linear-to-t from-black/4 to-transparent rounded-b-2xl pointer-events-none' />

 <div
 ref={scrollRef}
 onScroll={handleScroll}
 className='flex gap-5 sm:gap-6 overflow-x-auto overflow-y-visible pb-4 -mx-7 sm:mx-0 px-7 sm:px-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden [-webkit-overflow-scrolling:touch]'
>
 {/* ═══ HERO CARD ═══ */}
 {hero && (
 <motion.div
 initial={{ opacity: 0, y: 24 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true }}
 transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
 className='shrink-0 snap-start transition-all duration-500 ease-out'
 style={{
 width: hoveredPick !== null
 ?'clamp(200px, 30vw, 260px)'
 :'clamp(280px, 55vw, 480px)',
 }}
 onMouseEnter={() => setHoveredPick(null)}
>
 <Link href={`/products/${hero.slug}`}>
 <motion.div
 whileHover={{ y: -4 }}
 transition={{ type:'spring', stiffness: 300, damping: 20 }}
 className='group relative h-[500px] sm:h-[480px] rounded-2xl overflow-hidden border border-neutral-100 bg-white transition-shadow duration-300 motion-reduce:transition-none hover:[box-shadow:0_12px_48px_color-mix(in_srgb,#6366f1_14%,transparent)] motion-reduce:hover:[box-shadow:none]!'
>
 {hero.variants[0]?.images[0] ? (
 <Image
 src={hero.variants[0].images[0]}
 alt={hero.name}
 fill
 unoptimized
 sizes='480px'
 className='object-cover transition-transform duration-700 ease-out group-hover:scale-105'
 />
 ) : (
 <div className='flex h-full items-center justify-center text-neutral-300 text-sm'>
 No Image
 </div>
 )}

 <div className='absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent pointer-events-none' />

 <div
 className='absolute inset-0 opacity-[0.04] pointer-events-none'
 style={{
 backgroundImage:'radial-gradient(circle, #fff 0.5px, transparent 0.5px)',
 backgroundSize:'20px 20px',
 }}
 />

 <div className='absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm border border-white/20 text-[11px] font-bold text-vc-accent shadow-sm'>
 <Zap size={12} strokeWidth={2.5} />
 Featured Pick
 </div>

 <button
 onClick={(e) => handleWishlist(hero, e)}
 className={`
 absolute top-4 right-4 z-10 w-9 h-9 rounded-full flex items-center justify-center
 shadow-md transition-all duration-200
 bg-white/90 backdrop-blur-sm
 ${isInWishlist(hero._id)
 ?'text-red-500'
 :'text-neutral-400 hover:text-red-400'}
`}
 aria-label={isInWishlist(hero._id) ?'Remove from wishlist' :'Add to wishlist'}
>
 <Heart size={15} className={isInWishlist(hero._id) ?'fill-red-500' :''} />
 </button>

 <div className='absolute inset-x-0 bottom-0 p-5 sm:p-7'>
 <p className='text-[11px] font-semibold tracking-wider uppercase text-[#a5b4fc] mb-1.5'>
 {hero.brand}
 </p>
 <h3 className='text-[20px] sm:text-[26px] font-bold leading-tight text-white transition-colors duration-200 group-hover:text-[#a5b4fc]'>
 {hero.name}
 </h3>

 <div className='grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-all duration-500 ease-out'>
 <div className='overflow-hidden'>
 <p className='text-white/60 text-[13px] leading-relaxed mt-3 line-clamp-2'>
 {hero.description}
 </p>

 {hero.specs && hero.specs.length> 0 && (
 <div className='flex flex-wrap gap-1.5 mt-2'>
 {hero.specs.slice(0, 3).map((spec: any) => (
 <span
 key={spec.key}
 className='text-[10px] px-2 py-0.5 rounded-md bg-white/10 text-white/70 border border-white/10'
>
 {spec.value} {spec.key}
 </span>
 ))}
 </div>
 )}

 <div className='flex items-center gap-1.5 mt-2.5'>
 <div className='flex items-center gap-0.5'>
 {Array.from({ length: 5 }).map((_, j) => (
 <Star
 key={j}
 size={11}
 strokeWidth={1.5}
 className={
 j < Math.round(hero.avgRating)
 ?'fill-amber-400 text-amber-400'
 :'text-white/10'
 }
 />
 ))}
 </div>
 <span className='text-[11px] text-white/40'>
 {hero.avgRating?.toFixed(1)} ({hero.reviewCount})
 </span>
 </div>
 </div>
 </div>

 <div className='flex items-center justify-between mt-3 pt-3 border-t border-white/10'>
 <div className='flex items-baseline gap-2'>
 <span className='text-[22px] font-bold text-white'>
 ${hero.basePrice}
 </span>
 {hero.comparePrice && (
 <span className='text-[12px] text-white/30 line-through'>
 ${hero.comparePrice}
 </span>
 )}
 </div>
 <button
 onClick={(e) => handleAddToCart(hero, e)}
 className='flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-vc-accent text-[12px] font-semibold transition-all duration-200 hover:bg-white/90 active:scale-95 shadow-sm'
>
 <ShoppingCart size={14} strokeWidth={2} />
 Add to Cart
 </button>
 </div>
 </div>
 </motion.div>
 </Link>
 </motion.div>
 )}

 {/* ═══ PICK CARDS ═══ */}
 {picks.map((product, i) => {
 const img = product.variants[0]?.images[0] ?? null;
 const discount = product.comparePrice
 ? Math.round((1 - product.basePrice / product.comparePrice) * 100)
 : 0;

 return (
 <motion.div
 key={product._id}
 initial={{ opacity: 0, y: 20 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true }}
 transition={{ delay: i * 0.08 + 0.15, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
 className='shrink-0 snap-start transition-all duration-500 ease-out'
 style={{
 width: hoveredPick === i
 ?'clamp(280px, 55vw, 480px)'
 :'clamp(200px, 30vw, 260px)',
 }}
 onMouseEnter={() => setHoveredPick(i)}
 onMouseLeave={() => setHoveredPick(null)}
>
 <Link href={`/products/${product.slug}`}>
 <motion.div
 whileHover={{ y: -4 }}
 whileTap={{ scale: 0.98 }}
 transition={{ type:'spring', stiffness: 400, damping: 25 }}
 className='group relative h-105 sm:h-120 rounded-2xl overflow-hidden bg-white border border-neutral-100 transition-shadow duration-300 motion-reduce:transition-none hover:[box-shadow:0_8px_32px_color-mix(in_srgb,#6366f1_10%,transparent)] motion-reduce:hover:[box-shadow:none]!'
>
 {img ? (
 <Image
 src={img}
 alt={product.name}
 fill
 unoptimized
 sizes='260px'
 className='object-cover transition-transform duration-500 ease-out group-hover:scale-105'
 />
 ) : (
 <div className='flex h-full items-center justify-center text-neutral-300 text-sm'>
 No Image
 </div>
 )}

 <div className='absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent pointer-events-none' />

 {discount> 0 && (
 <span className='absolute top-3 left-3 z-10 text-[10px] font-bold px-2 py-0.5 rounded-full bg-linear-to-r from-[#ef4444] to-[#dc2626] text-white shadow'>
 -{discount}%
 </span>
 )}

 {/* quick-add floating btn */}
 <button
 onClick={(e) => handleAddToCart(product, e)}
 className='absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center text-neutral-600 hover:text-vc-accent transition-all duration-200 hover:scale-105 active:scale-90'
 aria-label='Quick add to cart'
>
 <ShoppingCart size={13} strokeWidth={2} />
 </button>

 {/* bottom content */}
 <div className='absolute inset-x-0 bottom-0 p-4 sm:p-5'>
 <p className='text-[10px] font-semibold tracking-wider uppercase text-[#a5b4fc] mb-1'>
 {product.brand}
 </p>
 <h3 className='text-[15px] sm:text-[17px] font-bold leading-tight text-white transition-colors duration-200 group-hover:text-[#a5b4fc]'>
 {product.name}
 </h3>

 <div className='grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-all duration-500 ease-out'>
 <div className='overflow-hidden'>
 <p className='text-white/50 text-[11px] leading-relaxed mt-2 line-clamp-2'>
 {product.description}
 </p>

 {product.specs && product.specs.length> 0 && (
 <div className='flex flex-wrap gap-1 mt-2'>
 {product.specs.slice(0, 2).map((spec: any) => (
 <span
 key={spec.key}
 className='text-[9px] px-1.5 py-0.5 rounded-md bg-white/10 text-white/60 border border-white/10'
>
 {spec.value} {spec.key}
 </span>
 ))}
 </div>
 )}

 <div className='flex items-center gap-1 mt-2'>
 <div className='flex items-center gap-0.5'>
 {Array.from({ length: 5 }).map((_, j) => (
 <Star
 key={j}
 size={9}
 strokeWidth={1.5}
 className={
 j < Math.round(product.avgRating)
 ?'fill-amber-400 text-amber-400'
 :'text-white/10'
 }
 />
 ))}
 </div>
 <span className='text-[10px] text-white/30'>
 ({product.reviewCount})
 </span>
 </div>
 </div>
 </div>

 <div className='flex items-center justify-between mt-2 pt-2 border-t border-white/10'>
 <div className='flex items-baseline gap-1.5'>
 <span className='text-[16px] font-bold text-white'>
 ${product.basePrice}
 </span>
 {product.comparePrice && (
 <span className='text-[10px] text-white/30 line-through'>
 ${product.comparePrice}
 </span>
 )}
 </div>
 <button
 onClick={(e) => handleAddToCart(product, e)}
 className='flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white text-vc-accent text-[11px] font-semibold transition-all duration-200 hover:bg-white/90 active:scale-95 shadow-sm'
>
 <ShoppingCart size={12} strokeWidth={2} />
 Add
 </button>
 </div>
 </div>
 </motion.div>
 </Link>
 </motion.div>
 );
 })}
 </div>
 </div>

 {/* scroll progress */}
 <div className='flex items-center justify-center gap-2 mt-4 sm:mt-6'>
 {Array.from({ length: totalSlides }).map((_, i) => (
 <div
 key={i}
 className={`h-1 rounded-full transition-all duration-400 ${
 activeDot === i ?'' :'bg-neutral-300'
 }`}
 style={activeDot === i ? {
 width: 20,
 opacity: 1,
 background:'linear-gradient(90deg, #6366f1, #8b5cf6)',
 } : {
 width: 6,
 opacity: 0.35,
 }}
 />
 ))}
 </div>
 </div>
 )}
 </div>
 </section>
 );
}
