'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { useUIStore }  from '@/store/uiStore';

export default function CartDrawer() {
  const { items, getTotal, removeItem, updateQty } = useCartStore();
  const { isCartOpen, closeCart } = useUIStore();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            className='fixed inset-0 bg-black/40 z-40'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
          />
          <motion.div
            className='fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col'
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {/* Header */}
            <div className='flex items-center justify-between p-5 border-b'>
              <h2 className='font-bold text-xl flex items-center gap-2'>
                <ShoppingCart size={20} /> Cart ({items.length})
              </h2>
              <button onClick={closeCart} className='p-2 hover:bg-gray-100 rounded-full'><X size={20}/></button>
            </div>

            {/* Items */}
            <div className='flex-1 overflow-y-auto p-5 space-y-4'>
              {items.length === 0 ? (
                <div className='text-center py-16 text-gray-400'>
                  <ShoppingCart size={48} className='mx-auto mb-3 opacity-30'/>
                  <p>Your cart is empty</p>
                </div>
              ) : (
                <AnimatePresence mode='popLayout'>
                  {items.map(item => (
                    <motion.div
                      key={item.variantSku}
                      layout
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0,  scale: 1    }}
                      exit={{    opacity: 0, x: 100, scale: 0.95 }}
                      transition={{ duration: 0.25 }}
                      className='flex gap-3 p-3 bg-gray-50 rounded-xl'
                    >
                      <img src={item.image} className='w-16 h-16 rounded-lg object-cover'/>
                      <div className='flex-1'>
                        <p className='font-medium text-sm line-clamp-1'>{item.name}</p>
                        <p className='text-brand-600 font-bold'>${item.price}</p>
                        <div className='flex items-center gap-2 mt-1'>
                          <button onClick={()=>item.quantity>1?updateQty(item.variantSku,item.quantity-1):removeItem(item.variantSku)} className='w-6 h-6 rounded bg-gray-200 text-sm font-bold flex items-center justify-center'>-</button>
                          <span className='text-sm'>{item.quantity}</span>
                          <button onClick={()=>updateQty(item.variantSku,item.quantity+1)} className='w-6 h-6 rounded bg-gray-200 text-sm font-bold flex items-center justify-center'>+</button>
                        </div>
                      </div>
                      <button onClick={()=>removeItem(item.variantSku)} className='text-gray-400 hover:text-red-400'><X size={16}/></button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className='p-5 border-t'>
                <div className='flex justify-between mb-4 font-bold text-lg'>
                  <span>Total</span><span>${getTotal().toFixed(2)}</span>
                </div>
                <Link href='/checkout' onClick={closeCart}
                  className='block w-full bg-brand-500 hover:bg-brand-600 text-white text-center py-3 rounded-xl font-semibold transition-colors'>
                  Checkout
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}