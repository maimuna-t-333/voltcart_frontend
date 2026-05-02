'use client';
import { useProducts } from '@/hooks/useProducts';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Star, Truck, Shield, RotateCcw, ChevronLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import api from '@/lib/axios';
import { Product } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import PageTransition from '@/components/layout/PageTransition';
import toast from 'react-hot-toast';
import { formatPrice } from '@/lib/utils';
import ProductCard from '@/components/product/ProductCard';

function RelatedProducts({ category, currentSlug }: { category: string, currentSlug: string }) {
  const { data } = useProducts({ category, limit: 4 });
  const related = data?.products.filter(p => p.slug !== currentSlug) || [];

  if (related.length === 0) return null;

  return (
    <div className='max-w-7xl mx-auto px-4 py-12 border-t border-gray-100'>
      <h2 className='text-2xl font-bold text-gray-900 mb-6'>Related Products</h2>
      <div className='grid grid-cols-2 md:grid-cols-4 gap-5'>
        {related.map(product => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState<'specs' | 'description'>('description');

  const addItem = useCartStore(s => s.addItem);
  const openCart = useUIStore(s => s.openCart);

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ['product', slug],
    queryFn: async () => {
      const { data } = await api.get(`/products/${slug}`);
      return data.data.product;
    },
  });

  if (isLoading) return (
    <div className='max-w-7xl mx-auto px-4 py-8'>
      <div className='grid md:grid-cols-2 gap-12'>
        <ProductCardSkeleton />
        <div className='space-y-4'>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className='h-8 bg-gray-200 rounded-lg animate-pulse' />
          ))}
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div className='text-center py-20'>
      <p className='text-6xl mb-4'>😕</p>
      <h2 className='text-2xl font-bold mb-2'>Product not found</h2>
      <Link href='/products' className='text-brand-500 hover:underline'>Back to products</Link>
    </div>
  );

  const variant = product.variants[selectedVariant];
  const images = variant.images.length > 0 ? variant.images : [null];

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
    <PageTransition>
      <div className='max-w-7xl mx-auto px-4 py-8'>
        {/* Breadcrumb */}
        <div className='flex items-center gap-2 text-sm text-gray-500 mb-8'>
          <Link href='/' className='hover:text-brand-500'>Home</Link>
          <span>/</span>
          <Link href='/products' className='hover:text-brand-500'>Products</Link>
          <span>/</span>
          <Link href={`/products?category=${product.category}`} className='hover:text-brand-500'>{product.category}</Link>
          <span>/</span>
          <span className='text-gray-900 font-medium'>{product.name}</span>
        </div>

        <div className='grid md:grid-cols-2 gap-12'>
          {/* Images */}
          <div>
            <motion.div
              className='relative aspect-square bg-gray-50 rounded-3xl overflow-hidden mb-4'
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {images[selectedImage] ? (
                <Image src={images[selectedImage]!} alt={product.name} fill sizes='(max-width: 768px) 100vw, 50vw' className='object-cover' />
              ) : (
                <div className='w-full h-full flex items-center justify-center text-gray-300 text-6xl'>
                  📦
                </div>
              )}
              {product.comparePrice && (
                <span className='absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full'>
                  -{Math.round((1 - product.basePrice / product.comparePrice) * 100)}% OFF
                </span>
              )}
            </motion.div>

            {/* Thumbnail row */}
            {images.length > 1 && (
              <div className='flex gap-3'>
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${selectedImage === i ? 'border-brand-500' : 'border-gray-200'}`}
                  >
                    {img ? <Image src={img} alt='' width={64} height={64} className='object-cover' /> : <div className='w-full h-full bg-gray-100' />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <p className='text-brand-500 font-semibold text-sm mb-2'>{product.brand}</p>
            <h1 className='text-3xl font-bold text-gray-900 mb-4'>{product.name}</h1>

            {/* Rating */}
            <div className='flex items-center gap-3 mb-6'>
              <div className='flex'>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={18}
                    className={i < Math.floor(product.avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200 fill-gray-200'}
                  />
                ))}
              </div>
              <span className='text-sm text-gray-500'>{product.avgRating.toFixed(1)} ({product.reviewCount} reviews)</span>
            </div>

            {/* Price */}
            <div className='flex items-baseline gap-3 mb-6'>
              <span className='text-4xl font-bold text-gray-900'>{formatPrice(variant.price)}</span>
              {product.comparePrice && (
                <span className='text-xl text-gray-400 line-through'>{formatPrice(product.comparePrice)}</span>
              )}
            </div>

            {/* Variants */}
            {product.variants.length > 1 && (
              <div className='mb-6'>
                <p className='font-semibold text-gray-700 mb-3'>
                  {product.variants[0].color ? 'Color' : 'Storage'}:
                  <span className='font-normal text-gray-500 ml-2'>{variant.color || variant.storage}</span>
                </p>
                <div className='flex flex-wrap gap-2'>
                  {product.variants.map((v, i) => (
                    <button
                      key={v.sku}
                      onClick={() => setSelectedVariant(i)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-colors ${selectedVariant === i ? 'border-brand-500 bg-brand-50 text-brand-600' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      {v.color || v.storage}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock */}
            <p className={`text-sm font-medium mb-6 ${variant.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
              {variant.stock > 10 ? '✓ In Stock' : variant.stock > 0 ? `⚡ Only ${variant.stock} left!` : '✗ Out of Stock'}
            </p>

            {/* Buttons */}
            <div className='flex gap-3 mb-8'>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                disabled={variant.stock === 0}
                className='flex-1 bg-brand-500 hover:bg-brand-600 disabled:bg-gray-300 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors'
              >
                <ShoppingCart size={20} />
                Add to Cart
              </motion.button>
              <button className='w-14 h-14 border-2 border-gray-200 rounded-2xl flex items-center justify-center hover:border-red-300 hover:text-red-400 transition-colors'>
                <Heart size={20} />
              </button>
            </div>

            {/* Perks */}
            <div className='grid grid-cols-3 gap-3 mb-8'>
              {[
                { icon: Truck, text: 'Free Shipping' },
                { icon: RotateCcw, text: '30-Day Returns' },
                { icon: Shield, text: '2-Year Warranty' },
              ].map(perk => (
                <div key={perk.text} className='flex flex-col items-center gap-1 bg-gray-50 rounded-xl p-3 text-center'>
                  <perk.icon size={18} className='text-brand-500' />
                  <span className='text-xs text-gray-600 font-medium'>{perk.text}</span>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className='border-b border-gray-200 mb-4'>
              <div className='flex gap-6'>
                {(['description', 'specs'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 text-sm font-semibold capitalize border-b-2 transition-colors ${activeTab === tab ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === 'description' ? (
              <p className='text-gray-600 leading-relaxed'>{product.description}</p>
            ) : (
              <div className='space-y-2'>
                {product.specs.map(spec => (
                  <div key={spec.key} className='flex justify-between py-2 border-b border-gray-100'>
                    <span className='text-gray-500 text-sm'>{spec.key}</span>
                    <span className='text-gray-900 text-sm font-medium'>{spec.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <RelatedProducts category={product.category} currentSlug={product.slug} />
    </PageTransition>
  );
}
