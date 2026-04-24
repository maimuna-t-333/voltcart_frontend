'use client';
import Image from 'next/image';
import Link  from 'next/link';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useUIStore }   from '@/store/uiStore';
import toast from 'react-hot-toast';

export default function ProductCard({ product }: { product: any }) {
  const addItem  = useCartStore(s => s.addItem);
  const openCart = useUIStore(s => s.openCart);

  const handleAddToCart = () => {
    const v = product.variants[0];
    addItem({ productId: product._id, variantSku: v.sku, name: product.name,
              image: v.images[0] || '/placeholder.png', price: v.price, quantity: 1 });
    openCart();
    toast.success('Added to cart!');
  };

  const img = product.variants[0]?.images[0] ?? null;

  return (
    <div className='bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group'>
      <Link href={`/products/${product.slug}`}>
        <div className='relative overflow-hidden rounded-t-2xl aspect-square bg-gray-50'>
          {img ? (
            <Image src={img} alt={product.name} fill className='object-cover group-hover:scale-105 transition-transform duration-300' />
          ) : (
            <div className='w-full h-full flex items-center justify-center text-gray-300 text-sm'>
              No Image
            </div>
          )}
        </div>
      </Link>
      <div className='p-4'>
        <p className='text-xs text-brand-500 font-medium mb-1'>{product.brand}</p>
        <Link href={`/products/${product.slug}`}><h3 className='font-semibold text-gray-800 text-sm line-clamp-2 hover:text-brand-600'>{product.name}</h3></Link>
        <div className='flex items-center gap-1 mt-2'>
          <Star size={14} className='fill-yellow-400 text-yellow-400' />
          <span className='text-xs text-gray-600'>{product.avgRating.toFixed(1)} ({product.reviewCount})</span>
        </div>
        <div className='flex items-center justify-between mt-3'>
          <div>
            <span className='font-bold text-gray-900'>${product.basePrice}</span>
            {product.comparePrice && <span className='text-xs text-gray-400 line-through ml-2'>${product.comparePrice}</span>}
          </div>
          <button onClick={handleAddToCart} className='bg-brand-500 hover:bg-brand-600 text-white p-2 rounded-xl transition-colors'>
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
