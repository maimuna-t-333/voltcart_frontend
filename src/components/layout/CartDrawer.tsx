'use client';
import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ShoppingCart, Trash2, Plus, Minus, Package,
  ArrowRight, ShoppingBag, Zap, Tag, Truck, ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';

const FREE_SHIPPING_THRESHOLD = 50;

export default function CartDrawer() {
  const { items, getTotal, removeItem, updateQty, couponCode, discount } = useCartStore();
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

  const subtotal  = items.reduce((n, i) => n + i.price * i.quantity, 0);
  const total     = getTotal();
  const itemCount = items.reduce((n, i) => n + i.quantity, 0);
  const shippingProgress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const remaining = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);
  const freeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* backdrop */}
          <motion.div
            className='fixed inset-0 z-50'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={closeCart}
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
          />

          {/* modal container */}
          <div className='fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none'>
            <motion.div
              className='cm relative w-full max-w-[480px] max-h-[88vh] rounded-2xl shadow-2xl flex flex-col pointer-events-auto overflow-hidden'
              initial={{ opacity: 0, scale: 0.93, y: 20 }}
              animate={{ opacity: 1, scale: 1,    y: 0  }}
              exit={{    opacity: 0, scale: 0.93, y: 20 }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
            >

              {/* ── HEADER ── */}
              <div className='flex items-center justify-between px-6 py-4 cm-border-b shrink-0'>
                <div className='flex items-center gap-3'>
                  <div className='relative w-9 h-9 rounded-xl flex items-center justify-center cm-accent-bg'>
                    <ShoppingCart size={16} strokeWidth={2.5} className='cm-accent' />
                    {itemCount > 0 && (
                      <motion.span
                        key={itemCount}
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        className='absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-[10px] font-bold text-white flex items-center justify-center cm-badge'
                      >
                        {itemCount}
                      </motion.span>
                    )}
                  </div>
                  <div>
                    <h2 className='font-bold text-[15px] cm-text leading-none'>Your Cart</h2>
                    <p className='text-[11px] cm-muted mt-0.5'>
                      {itemCount === 0 ? 'Empty' : `${itemCount} item${itemCount !== 1 ? 's' : ''}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeCart}
                  aria-label='Close cart'
                  className='cm-close flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-200'
                >
                  <X size={16} strokeWidth={2.5} />
                </button>
              </div>

              {/* ── FREE SHIPPING BAR ── */}
              {items.length > 0 && (
                <div className='px-6 py-3 cm-shipping-bg shrink-0'>
                  <div className='flex items-center justify-between mb-1.5'>
                    <div className='flex items-center gap-1.5'>
                      <Truck size={12} strokeWidth={2.5} className={freeShipping ? 'text-green-500' : 'cm-muted'} />
                      <span className='text-[11.5px] font-medium cm-muted'>
                        {freeShipping
                          ? <span className='text-green-500 font-semibold'>You've unlocked free shipping!</span>
                          : <><span className='cm-text font-semibold'>${remaining.toFixed(2)}</span> away from free shipping</>
                        }
                      </span>
                    </div>
                    <span className='text-[10px] font-semibold cm-muted'>${FREE_SHIPPING_THRESHOLD}</span>
                  </div>
                  <div className='h-1.5 rounded-full cm-progress-track overflow-hidden'>
                    <motion.div
                      className='h-full rounded-full cm-progress-fill'
                      initial={{ width: 0 }}
                      animate={{ width: `${shippingProgress}%` }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                </div>
              )}

              {/* ── BODY ── */}
              <div className='flex-1 overflow-y-auto cm-scroll px-6 py-4'>
                {items.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    className='flex flex-col items-center justify-center py-16 text-center'
                  >
                    <motion.div
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                      className='w-20 h-20 rounded-2xl flex items-center justify-center mb-5 cm-accent-bg'
                    >
                      <ShoppingBag size={32} strokeWidth={1.5} className='cm-accent' />
                    </motion.div>
                    <p className='text-[15px] font-bold cm-text mb-1.5'>Your cart is empty</p>
                    <p className='text-[12.5px] cm-muted mb-6 max-w-[200px] leading-relaxed'>
                      Discover the latest gadgets and add them here
                    </p>
                    <Link
                      href='/products'
                      onClick={closeCart}
                      className='cm-cta inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all duration-200'
                    >
                      <Zap size={13} strokeWidth={2.5} />
                      Browse Products
                    </Link>
                  </motion.div>
                ) : (
                  <div className='space-y-3'>
                    <AnimatePresence mode='popLayout'>
                      {items.map((item, idx) => (
                        <motion.div
                          key={item.variantSku}
                          layout
                          initial={{ opacity: 0, y: 16, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0,  scale: 1    }}
                          exit={{    opacity: 0, x: 80, scale: 0.94 }}
                          transition={{ duration: 0.25, delay: idx * 0.07 }}
                          className='cm-item flex gap-4 p-3.5 rounded-xl'
                        >
                          {/* image */}
                          <div className='relative w-[72px] h-[72px] rounded-xl overflow-hidden shrink-0 cm-img-bg'>
                            {item.image ? (
                              <>
                                <Image src={item.image} alt={item.name} fill sizes='72px' className='object-cover' unoptimized />
                                <div className='absolute inset-0 cm-img-overlay' />
                              </>
                            ) : (
                              <div className='flex items-center justify-center w-full h-full'>
                                <Package size={24} strokeWidth={1.5} className='cm-muted' />
                              </div>
                            )}
                          </div>

                          {/* info */}
                          <div className='flex-1 min-w-0'>
                            <p className='text-[13px] font-semibold cm-text leading-snug line-clamp-2'>
                              {item.name}
                            </p>
                            <div className='flex items-baseline gap-2 mt-1'>
                              <span className='text-[15px] font-bold cm-accent'>
                                ${(item.price * item.quantity).toFixed(2)}
                              </span>
                              {item.quantity > 1 && (
                                <span className='text-[11px] cm-muted'>
                                  ${item.price.toFixed(2)} ea.
                                </span>
                              )}
                            </div>

                            {/* qty row */}
                            <div className='flex items-center gap-2 mt-2.5'>
                              <div className='flex items-center cm-qty-wrap rounded-lg overflow-hidden'>
                                <button
                                  onClick={() => item.quantity > 1
                                    ? updateQty(item.variantSku, item.quantity - 1)
                                    : removeItem(item.variantSku)}
                                  className='cm-qty-btn flex items-center justify-center w-7 h-7 transition-all duration-150'
                                  aria-label='Decrease'
                                >
                                  <Minus size={11} strokeWidth={2.5} />
                                </button>
                                <span className='text-[13px] font-bold cm-text w-7 text-center tabular-nums'>
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQty(item.variantSku, item.quantity + 1)}
                                  className='cm-qty-btn flex items-center justify-center w-7 h-7 transition-all duration-150'
                                  aria-label='Increase'
                                >
                                  <Plus size={11} strokeWidth={2.5} />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* remove */}
                          <button
                            onClick={() => removeItem(item.variantSku)}
                            className='cm-remove flex items-center justify-center w-7 h-7 rounded-lg self-start shrink-0 transition-all duration-150'
                            aria-label='Remove'
                          >
                            <Trash2 size={13} strokeWidth={2} />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* ── FOOTER ── */}
              {items.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className='shrink-0 px-6 pt-4 pb-5 cm-border-t'
                >
                  {/* coupon */}
                  {couponCode && discount > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className='flex items-center justify-between mb-3 px-3 py-2 rounded-xl cm-coupon'
                    >
                      <div className='flex items-center gap-2'>
                        <Tag size={12} strokeWidth={2.5} className='cm-accent' />
                        <span className='text-[12px] font-semibold cm-accent'>{couponCode}</span>
                      </div>
                      <span className='text-[12px] font-bold text-green-500'>−${discount.toFixed(2)}</span>
                    </motion.div>
                  )}

                  {/* order summary */}
                  <div className='cm-summary rounded-xl p-4 mb-4 space-y-2'>
                    <div className='flex justify-between text-[12.5px]'>
                      <span className='cm-muted'>Subtotal ({itemCount} item{itemCount !== 1 ? 's' : ''})</span>
                      <span className='cm-text font-semibold'>${subtotal.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                      <div className='flex justify-between text-[12.5px]'>
                        <span className='cm-muted'>Discount</span>
                        <span className='text-green-500 font-semibold'>−${discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className='flex justify-between text-[12.5px]'>
                      <span className='cm-muted'>Shipping</span>
                      <span className={freeShipping ? 'text-green-500 font-semibold' : 'cm-muted'}>
                        {freeShipping ? 'Free' : 'Calculated at checkout'}
                      </span>
                    </div>
                    <div className='pt-2 mt-1 cm-summary-divider flex justify-between items-baseline'>
                      <span className='text-[14px] font-bold cm-text'>Total</span>
                      <motion.span
                        key={total}
                        initial={{ scale: 1.08 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className='text-[22px] font-bold cm-text tabular-nums'
                      >
                        ${total.toFixed(2)}
                      </motion.span>
                    </div>
                  </div>

                  {/* checkout */}
                  <Link
                    href='/checkout'
                    onClick={closeCart}
                    className='cm-cta cm-cta-shimmer relative flex items-center justify-center gap-2 w-full py-4 rounded-xl text-[14px] font-bold text-white overflow-hidden transition-all duration-200 active:scale-[0.98]'
                  >
                    <span className='relative z-10 flex items-center gap-2'>
                      Proceed to Checkout
                      <ArrowRight size={16} strokeWidth={2.5} />
                    </span>
                  </Link>

                  {/* secondary actions */}
                  <div className='flex items-center justify-between mt-3'>
                    <button
                      onClick={closeCart}
                      className='flex items-center gap-1 text-[12px] font-medium cm-muted hover:cm-text transition-colors duration-200'
                    >
                      <ChevronRight size={12} style={{ transform: 'rotate(180deg)' }} strokeWidth={2.5} />
                      Continue shopping
                    </button>
                    <Link
                      href='/cart'
                      onClick={closeCart}
                      className='text-[12px] font-medium cm-accent-text hover:underline transition-colors duration-200'
                    >
                      View full cart
                    </Link>
                  </div>
                </motion.div>
              )}

            </motion.div>
          </div>

          <style>{`
            .cm {
              background: var(--card);
              border: 1px solid var(--card-bdr);
            }
            .cm-border-b { border-bottom: 1px solid var(--border); }
            .cm-border-t { border-top:    1px solid var(--border); }
            .cm-text      { color: var(--tx); }
            .cm-muted     { color: var(--tx2); }
            .cm-accent    { color: var(--accent); }
            .cm-accent-text { color: var(--accent); }
            .cm-accent-bg { background: var(--accent-dim); }
            .cm-badge     { background: var(--accent); }

            .cm-shipping-bg { background: var(--surface); border-bottom: 1px solid var(--border); }
            .cm-progress-track { background: var(--border); }
            .cm-progress-fill  { background: linear-gradient(90deg, #6366f1, #8b5cf6); }

            .cm-item {
              background: var(--surface);
              border: 1px solid var(--border);
              transition: border-color 0.2s, box-shadow 0.2s;
            }
            .cm-item:hover {
              border-color: var(--border-hi);
              box-shadow: 0 2px 12px rgba(99,102,241,0.08);
            }

            .cm-img-bg { background: var(--accent-dim); }
            .cm-img-overlay {
              background: linear-gradient(to top, rgba(0,0,0,0.15) 0%, transparent 50%);
            }

            .cm-qty-wrap {
              border: 1px solid var(--border);
              background: var(--surface);
            }
            .cm-qty-btn { color: var(--tx2); }
            .cm-qty-btn:hover {
              background: var(--accent-dim);
              color: var(--accent);
            }

            .cm-remove { color: var(--tx3); }
            .cm-remove:hover {
              background: rgba(239,68,68,0.1);
              color: #ef4444;
            }

            .cm-close { color: var(--tx2); }
            .cm-close:hover { background: var(--surface); color: var(--tx); }

            .cm-coupon { background: var(--accent-dim); border: 1px solid rgba(99,102,241,0.15); }

            .cm-summary {
              background: var(--surface);
              border: 1px solid var(--border);
            }
            .cm-summary-divider { border-top: 1px solid var(--border); }

            .cm-cta {
              background: linear-gradient(135deg, #6366f1, #4f46e5);
              box-shadow: 0 4px 20px rgba(99,102,241,0.4);
            }
            .cm-cta:hover {
              filter: brightness(1.08);
              box-shadow: 0 6px 28px rgba(99,102,241,0.55);
            }
            .cm-cta-shimmer::before {
              content: '';
              position: absolute;
              inset: 0;
              background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%);
              background-size: 200% 100%;
              animation: cm-shimmer 2.5s infinite;
            }
            @keyframes cm-shimmer {
              0%   { background-position: 200% 0; }
              100% { background-position: -200% 0; }
            }

            .cm-scroll::-webkit-scrollbar { width: 4px; }
            .cm-scroll::-webkit-scrollbar-track { background: transparent; }
            .cm-scroll::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
          `}</style>
        </>
      )}
    </AnimatePresence>
  );
}
