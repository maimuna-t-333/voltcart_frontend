'use client';
import { motion } from'framer-motion';
import Image from'next/image';
import Link from'next/link';
import { Heart, ShoppingCart, Star } from'lucide-react';
import { useCartStore } from'@/store/cartStore';
import { useUIStore } from'@/store/uiStore';
import { useWishlistStore } from'@/store/wishlistStore';
import { useAuthStore } from'@/store/authStore';
import type { Product } from'@/types';
import toast from'react-hot-toast';

const brandAccent = (brand: string) => {
 const map: Record<string, string> = {
 Apple:'#a78bfa', Samsung:'#60a5fa', Sony:'#34d399', Google:'#fb923c',
 Microsoft:'#38bdf8', LG:'#f472b6', Dell:'#818cf8', HP:'#4ade80',
 Lenovo:'#fb7185', Asus:'#facc15', Razer:'#4ade80', Bose:'#c084fc',
 JBL:'#f97316', DJI:'#22d3ee', Nintendo:'#f87171',
 };
 return map[brand] ||'#818cf8';
};

export default function ProductCard({ product }: { product: Product }) {
 const addItem = useCartStore(s => s.addItem);
 const openCart = useUIStore(s => s.openCart);
 const { toggleWishlist, isInWishlist } = useWishlistStore();
 const user = useAuthStore(s => s.user);
 const wishlisted = isInWishlist(product._id);

 const handleAddToCart = (e?: React.MouseEvent) => {
 e?.preventDefault(); e?.stopPropagation();
 const v = product.variants[0];
 addItem({ productId: product._id, variantSku: v.sku, name: product.name,
 image: v.images[0] ||'', price: v.price, quantity: 1 });
 openCart();
 toast.success('Added to cart!');
 };

 const handleWishlist = (e: React.MouseEvent) => {
 e.preventDefault(); e.stopPropagation();
 if (!user) { toast.error('Please log in to save items'); return; }
 const v = product.variants[0];
 toggleWishlist({ _id: product._id, name: product.name, brand: product.brand,
 slug: product.slug, basePrice: product.basePrice, comparePrice: product.comparePrice,
 variantSku: v?.sku ??'', image: v?.images[0] ??'' });
 };

 const img = product.variants[0]?.images[0] ?? null;
 const price = product.variants[0]?.price ?? product.basePrice;
 const discount = product.comparePrice
 ? Math.round((1 - product.basePrice / product.comparePrice) * 100) : 0;
 const accent = brandAccent(product.brand);
 const specs = product.specs?.slice(0, 3) ?? [];
 const hasRating = product.avgRating> 0;

 return (
 <Link href={`/products/${product.slug}`}>
 <motion.article
 whileHover={{ y: -4 }}
 whileTap={{ scale: 0.98 }}
 transition={{ type:'spring', stiffness: 340, damping: 24 }}
 className='group relative h-[360px] sm:h-[420px] rounded-2xl overflow-hidden cursor-pointer
 bg-white 
 border border-neutral-100'
>
 {/* image */}
 {img ? (
 <Image src={img} alt={product.name} fill unoptimized
 sizes='(max-width: 640px) 50vw, 33vw'
 className='object-contain transition-transform duration-700 ease-out group-hover:scale-105' />
 ) : (
 <div className='flex h-full items-center justify-center text-neutral-300 text-sm'>
 No Image
 </div>
 )}

 {/* gradient overlay */}
 <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none' />

 {/* dot-matrix texture */}
 <div className='absolute inset-0 opacity-[0.015] pointer-events-none'
 style={{
 backgroundImage:'radial-gradient(circle, #fff 0.5px, transparent 0.5px)',
 backgroundSize:'20px 20px',
 }}
 />

 {/* discount badge */}
 {discount> 0 && (
 <span className='absolute top-3 left-3 z-10 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-[#ef4444] to-[#dc2626] text-white shadow'>
 -{discount}%
 </span>
 )}

 {/* top-right button group */}
 <div className='absolute top-3 right-3 z-10 flex gap-1.5'>
 {/* quick add */}
 <button onClick={handleAddToCart}
 className='w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all duration-200
 bg-white/90 backdrop-blur-sm
 text-neutral-600 hover:text-[#6366f1] hover:scale-105 active:scale-90'
 aria-label='Quick add to cart'>
 <ShoppingCart size={13} strokeWidth={2} />
 </button>
 {/* wishlist */}
 <button onClick={handleWishlist}
 className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all duration-200
 bg-white/90 backdrop-blur-sm
 ${wishlisted ?'text-red-500' :'text-neutral-400 hover:text-red-400'}`}
 aria-label='Wishlist'>
 <Heart size={14} className={wishlisted ?'fill-red-500' :''} />
 </button>
 </div>

 {/* bottom content */}
 <div className='absolute inset-x-0 bottom-0 p-4 sm:p-5'>
 {/* brand */}
 <p className='text-[10px] font-semibold tracking-wider uppercase text-[#a5b4fc] mb-1'>
 {product.brand}
 </p>

 {/* name */}
 <h3 className='text-[15px] sm:text-[17px] font-bold leading-tight text-white transition-colors duration-200 group-hover:text-[#a5b4fc] line-clamp-1'>
 {product.name}
 </h3>

 {/* specs */}
 {specs.length> 0 && (
 <div className='flex flex-wrap gap-1 mt-2'>
 {specs.map(s => (
 <span key={s.key}
 className='text-[9px] px-1.5 py-0.5 rounded-md bg-white/10 text-white/60 border border-white/10'>
 {s.value} {s.key}
 </span>
 ))}
 </div>
 )}

 {/* rating */}
 {hasRating && (
 <div className='flex items-center gap-1 mt-1.5'>
 <div className='flex items-center gap-0.5'>
 {Array.from({ length: 5 }).map((_, j) => (
 <Star key={j} size={9} strokeWidth={1.5}
 className={j < Math.round(product.avgRating) ?'fill-amber-400 text-amber-400' :'text-white/10'} />
 ))}
 </div>
 <span className='text-[10px] text-white/30'>({product.reviewCount})</span>
 </div>
 )}

 {/* price */}
 <div className='flex items-center gap-1.5 mt-2.5 pt-2.5 border-t border-white/10'>
 <span className='text-[16px] font-bold text-white'>${price}</span>
 {product.comparePrice && (
 <span className='text-[10px] text-white/30 line-through'>${product.comparePrice}</span>
 )}
 </div>
 </div>

 {/* hover glow */}
 <div className='absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none'
 style={{ boxShadow:'inset 0 0 0 1px rgba(99,102,241,0.15), 0 8px 32px rgba(99,102,241,0.1)' }} />
 </motion.article>
 </Link>
 );
}
