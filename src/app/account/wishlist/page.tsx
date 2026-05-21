'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';
import { useWishlistStore, type WishlistItem } from '@/store/wishlistStore';
import { formatPrice } from '@/lib/utils';
import PageTransition from '@/components/layout/PageTransition';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function WishlistPage() {
  const { items: wishlist, removeFromWishlist } = useWishlistStore();
  const addItem = useCartStore(s => s.addItem);
  const openCart = useUIStore(s => s.openCart);

  const addToCart = (item: WishlistItem) => {
    addItem({
      productId: item._id,
      variantSku: item.variantSku,
      name: item.name,
      image: item.image,
      price: item.basePrice,
      quantity: 1,
    });
    openCart();
    toast.success('Added to cart!');
  };

  return (
    <PageTransition>
      <div className='max-w-4xl mx-auto px-4 py-8'>
        <div className='flex items-center gap-3 mb-8'>
          <Heart size={24} className='text-brand-500' />
          <h1 className='text-2xl font-bold text-gray-900'>My Wishlist</h1>
          <span className='text-gray-400'>({wishlist.length} items)</span>
        </div>

        {wishlist.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className='text-center py-20'
          >
            <Heart size={80} className='mx-auto text-gray-200 mb-6' />
            <h2 className='text-xl font-bold text-gray-900 mb-2'>Your wishlist is empty</h2>
            <p className='text-gray-500 mb-8'>Save products you love to buy them later</p>
            <Link href='/products'
              className='inline-flex items-center gap-2 bg-brand-500 text-white font-bold px-8 py-4 rounded-2xl hover:bg-brand-600 transition-colors'>
              Browse Products
            </Link>
          </motion.div>
        ) : (
          <div className='grid sm:grid-cols-2 gap-5'>
            <AnimatePresence>
              {wishlist.map(item => (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className='bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow'
                >
                  <Link href={`/products/${item.slug}`}>
                    <div className='aspect-square bg-gray-50 flex items-center justify-center text-6xl'>
                      📦
                    </div>
                  </Link>
                  <div className='p-4'>
                    <p className='text-xs text-brand-500 font-medium'>{item.brand}</p>
                    <Link href={`/products/${item.slug}`}>
                      <h3 className='font-semibold text-gray-900 hover:text-brand-600 transition-colors'>{item.name}</h3>
                    </Link>
                    <div className='flex items-center justify-between mt-3'>
                      <div>
                        <span className='font-bold text-gray-900'>{formatPrice(item.basePrice)}</span>
                        {item.comparePrice && (
                          <span className='text-sm text-gray-400 line-through ml-2'>{formatPrice(item.comparePrice)}</span>
                        )}
                      </div>
                    </div>
                    <div className='flex gap-2 mt-3'>
                      <button onClick={() => addToCart(item)}
                        className='flex-1 flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-medium py-2 rounded-xl transition-colors text-sm'>
                        <ShoppingCart size={16} />
                        Add to Cart
                      </button>
                      <button onClick={() => removeFromWishlist(item._id)}
                        className='w-10 h-10 flex items-center justify-center border border-gray-200 rounded-xl hover:border-red-300 hover:text-red-400 transition-colors'>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
