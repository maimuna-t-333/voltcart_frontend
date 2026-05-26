'use client';
import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Trash2, Plus, Minus, Package, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/cartStore';
import { useUIStore }  from '@/store/uiStore';

export default function CartDrawer() {
  const { items, getTotal, removeItem, updateQty } = useCartStore();
  const { isCartOpen, closeCart } = useUIStore();

  const onKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') closeCart();
  }, [closeCart]);

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', onKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isCartOpen, onKeyDown]);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            className='fixed inset-0 z-40'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            style={{ background: 'rgba(0,0,0,0.45)' }}
          />
          <motion.div
            className='fixed right-0 top-0 h-full w-full max-w-md z-50 shadow-2xl flex flex-col cd'
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {/* Header */}
            <div className='flex items-center justify-between px-5 py-4 border-b' style={{ borderColor: 'var(--cd-border, #e8e8e8)' }}>
              <h2 className='font-bold text-[16px] flex items-center gap-2' style={{ color: 'var(--cd-text, #111)' }}>
                <ShoppingCart size={18} strokeWidth={2} style={{ color: 'var(--cd-accent, #6366f1)' }} />
                Cart
                {items.length > 0 && (
                  <span className='flex items-center justify-center h-5 min-w-[20px] px-1.5 text-[11px] font-bold rounded-full text-white' style={{ background: 'var(--cd-accent, #6366f1)' }}>
                    {items.length}
                  </span>
                )}
              </h2>
              <button
                onClick={closeCart}
                className='cd-btn-close flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-200'
              >
                <X size={17} />
              </button>
            </div>

            {/* Items */}
            <div className='flex-1 overflow-y-auto p-5 space-y-3 relative cd-scroll'>
              {items.length === 0 ? (
                <div className='flex flex-col items-center justify-center py-20' style={{ color: 'var(--cd-muted, #aaa)' }}>
                  <div className='flex items-center justify-center w-16 h-16 rounded-2xl mb-4' style={{ background: 'var(--cd-dim, rgba(99,102,241,0.08))' }}>
                    <ShoppingCart size={28} strokeWidth={1.5} style={{ color: 'var(--cd-accent, #6366f1)' }} />
                  </div>
                  <p className='text-[14px] font-medium' style={{ color: 'var(--cd-text, #111)' }}>Your cart is empty</p>
                  <p className='text-[12px] mt-1' style={{ color: 'var(--cd-muted2, #ccc)' }}>Add some gadgets to get started</p>
                  <div className='mt-6'>
                    <Link
                      href='/'
                      onClick={closeCart}
                      className='flex items-center gap-2 text-[13px] font-semibold transition-all duration-200'
                      style={{ color: 'var(--cd-accent, #6366f1)' }}
                    >
                      <ArrowLeft size={14} strokeWidth={2.5} />
                      Continue shopping
                    </Link>
                  </div>
                </div>
              ) : (
                <AnimatePresence mode='popLayout'>
                  {items.map(item => (
                    <motion.div
                      key={item.variantSku}
                      layout
                      initial={{ opacity: 0, y: 16, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0,  scale: 1    }}
                      exit={{    opacity: 0, x: 80, scale: 0.95 }}
                      transition={{ duration: 0.25 }}
                      className='flex gap-3 p-3 rounded-xl cd-item'
                    >
                      {item.image ? (
                        <div className='relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0' style={{ background: 'var(--cd-dim, rgba(99,102,241,0.06))' }}>
                          <Image src={item.image} alt={item.name} fill sizes='64px' className='object-cover' />
                        </div>
                      ) : (
                        <div className='flex items-center justify-center w-16 h-16 rounded-lg flex-shrink-0' style={{ background: 'var(--cd-dim, rgba(99,102,241,0.06))' }}>
                          <Package size={20} strokeWidth={1.5} style={{ color: 'var(--cd-muted, #aaa)' }} />
                        </div>
                      )}

                      <div className='flex-1 min-w-0'>
                        <p className='text-[13px] font-semibold leading-snug truncate' style={{ color: 'var(--cd-text, #111)' }}>
                          {item.name}
                        </p>
                        <p className='text-[14px] font-bold mt-0.5' style={{ color: 'var(--cd-accent, #6366f1)' }}>
                          ${item.price}
                        </p>
                        <div className='flex items-center gap-2 mt-2'>
                          <button
                            onClick={() => item.quantity > 1 ? updateQty(item.variantSku, item.quantity - 1) : removeItem(item.variantSku)}
                            className='cd-qty-btn flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-200'
                          >
                            <Minus size={12} strokeWidth={2.5} />
                          </button>
                          <span className='text-[13px] font-semibold w-5 text-center' style={{ color: 'var(--cd-text, #111)' }}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQty(item.variantSku, item.quantity + 1)}
                            className='cd-qty-btn flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-200'
                          >
                            <Plus size={12} strokeWidth={2.5} />
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => removeItem(item.variantSku)}
                        className='cd-btn-remove flex items-center justify-center w-7 h-7 rounded-lg self-start transition-all duration-200 flex-shrink-0'
                      >
                        <Trash2 size={14} strokeWidth={2} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <motion.div
                className='p-5 border-t'
                style={{ borderColor: 'var(--cd-border, #e8e8e8)' }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
              >
                <div className='flex justify-between items-baseline mb-5'>
                  <span className='text-[14px] font-semibold' style={{ color: 'var(--cd-text, #111)' }}>Total</span>
                  <span className='text-[20px] font-bold' style={{ color: 'var(--cd-text, #111)' }}>${getTotal().toFixed(2)}</span>
                </div>
                <Link
                  href='/checkout'
                  onClick={closeCart}
                  className='cd-btn-checkout flex items-center justify-center w-full py-3 rounded-xl text-[14px] font-bold text-white transition-all duration-200 active:scale-[0.98]'
                >
                  Checkout
                </Link>
              </motion.div>
            )}
          </motion.div>

          <style>{`
            .cd {
              --cd-bg: #ffffff;
              --cd-surface: #f7f7f7;
              --cd-border: #e8e8e8;
              --cd-text: #111111;
              --cd-muted: #aaaaaa;
              --cd-muted2: #cccccc;
              --cd-accent: #6366f1;
              --cd-accent-hover: #4f46e5;
              --cd-dim: rgba(99,102,241,0.08);
              --cd-dim2: rgba(0,0,0,0.06);
            }
            .dark .cd {
              --cd-bg: #111111;
              --cd-surface: #1a1a1a;
              --cd-border: #222222;
              --cd-text: #e8e8e8;
              --cd-muted: #666666;
              --cd-muted2: #444444;
              --cd-accent: #818cf8;
              --cd-accent-hover: #6366f1;
              --cd-dim: rgba(129,140,248,0.12);
              --cd-dim2: rgba(255,255,255,0.06);
            }

            .cd-scroll::-webkit-scrollbar { width: 4px; }
            .cd-scroll::-webkit-scrollbar-track { background: transparent; }
            .cd-scroll::-webkit-scrollbar-thumb {
              background: var(--cd-dim2);
              border-radius: 4px;
            }

            .cd-btn-close {
              color: var(--cd-muted);
              background: transparent;
            }
            .cd-btn-close:hover {
              background: var(--cd-dim2);
              color: var(--cd-text);
            }

            .cd-item { background: var(--cd-surface); }

            .cd-qty-btn {
              background: var(--cd-dim2);
              color: var(--cd-text);
            }
            .cd-qty-btn:hover {
              background: var(--cd-dim);
            }
            .cd-qty-btn:focus-visible {
              outline: 2px solid var(--cd-accent);
              outline-offset: 2px;
            }

            .cd-btn-remove { color: var(--cd-muted); }
            .cd-btn-remove:hover {
              background: var(--cd-dim2);
              color: #ef4444;
            }

            .cd-btn-checkout { background: var(--cd-accent); }
            .cd-btn-checkout:hover { background: var(--cd-accent-hover); }
          `}</style>
        </>
      )}
    </AnimatePresence>
  );
}
