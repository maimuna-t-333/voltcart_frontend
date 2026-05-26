'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link  from 'next/link';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useUIStore }   from '@/store/uiStore';
import { useWishlistStore } from '@/store/wishlistStore';
import {useAuthStore} from '@/store/authStore';
import toast from 'react-hot-toast';

export default function ProductCard({ product }: { product: any }) {
  const addItem  = useCartStore(s => s.addItem);
  const openCart = useUIStore(s => s.openCart);
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const user = useAuthStore(s => s.user);
  const wishlisted = isInWishlist(product._id);

  const handleAddToCart = () => {
    const v = product.variants[0];
    addItem({ productId: product._id, variantSku: v.sku, name: product.name,
              image: v.images[0] || '', price: v.price, quantity: 1 });
    openCart();
    toast.success('Added to cart!');
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in to save items');
      return;
    }

    const v = product.variants[0];
    toggleWishlist({
      _id:          product._id,
      name:         product.name,
      brand:        product.brand,
      slug:         product.slug,
      basePrice:    product.basePrice,
      comparePrice: product.comparePrice,
      variantSku:   v?.sku ?? '',
      image:        v?.images[0] ?? '',
    });
  };

  const img = product.variants[0]?.images[0] ?? null;
  const discount = product.comparePrice
    ? Math.round((1 - product.basePrice / product.comparePrice) * 100)
    : 0;

  return (
    <motion.div
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className='pc group relative flex flex-col rounded-2xl bg-white dark:bg-[#0c0a14] border border-neutral-100 dark:border-white/[0.06] transition-all duration-250'
    >
      <Link href={`/products/${product.slug}`} className='block'>
        {/* image */}
        <div className='relative overflow-hidden rounded-t-2xl aspect-square bg-[#f5f5f5] dark:bg-white/[0.03]'>
          {img ? (
            <Image
              src={img}
              alt={product.name}
              fill
              sizes='(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'
              className='object-cover group-hover:scale-105 transition-transform duration-500 ease-out'
            />
          ) : (
            <div className='flex h-full items-center justify-center text-[12px] text-neutral-300 dark:text-white/15'>
              No Image
            </div>
          )}

          {/* discount badge */}
          {discount > 0 && (
            <span className='absolute top-3 left-3 z-10 text-[11px] font-bold px-2.5 py-1 rounded-full bg-gradient-to-r from-[#ef4444] to-[#dc2626] text-white shadow-lg'>
              -{discount}%
            </span>
          )}

          {/* wishlist */}
          <button
            onClick={handleWishlist}
            className={`
              absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center
              shadow-md transition-all duration-200
              opacity-0 group-hover:opacity-100
              ${wishlisted
                ? 'bg-red-500 text-white'
                : 'bg-white/90 dark:bg-[#1c1c2a] text-neutral-400 dark:text-white/40 hover:text-red-400 dark:hover:text-red-400'}
            `}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart size={14} className={wishlisted ? 'fill-white' : ''} />
          </button>
        </div>
      </Link>

      {/* body */}
      <div className='flex flex-1 flex-col gap-1.5 p-4'>
        {/* brand */}
        <p className='text-[11px] font-semibold tracking-wider uppercase text-[#7c3aed] dark:text-[#818cf8]'>
          {product.brand}
        </p>

        {/* name */}
        <Link href={`/products/${product.slug}`}>
          <h3 className='text-[13.5px] font-bold leading-snug text-neutral-800 dark:text-white/85 transition-colors duration-200 hover:text-[#6366f1] dark:hover:text-[#a5b4fc] line-clamp-2'>
            {product.name}
          </h3>
        </Link>

        {/* rating */}
        <div className='flex items-center gap-1.5 mt-0.5'>
          <div className='flex items-center gap-0.5'>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={11}
                strokeWidth={1.5}
                className={i < Math.round(product.avgRating) ? 'fill-amber-400 text-amber-400' : 'text-neutral-200 dark:text-white/[0.08]'}
              />
            ))}
          </div>
          <span className='text-[11.5px] text-neutral-400 dark:text-white/35'>
            {product.avgRating?.toFixed(1)} ({product.reviewCount})
          </span>
        </div>

        {/* spacer */}
        <div className='flex-1' />

        {/* price + cart */}
        <div className='flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-white/[0.06]'>
          <div className='flex items-baseline gap-2'>
            <span className='text-[16px] font-bold text-neutral-900 dark:text-white/90'>${product.basePrice}</span>
            {product.comparePrice && (
              <span className='text-[12px] text-neutral-400 dark:text-white/30 line-through'>${product.comparePrice}</span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            className='flex items-center justify-center w-9 h-9 rounded-xl bg-[#6366f1] dark:bg-[#6366f1] text-white transition-all duration-200 hover:bg-[#4f46e5] dark:hover:bg-[#818cf8] active:scale-90'
          >
            <ShoppingCart size={15} strokeWidth={2} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
