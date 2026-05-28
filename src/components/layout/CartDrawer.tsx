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
          <motion.div
            className='fixed inset-0 z-50'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={closeCart}
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)' }}
          />

          <div className='fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4'>
            <motion.div
              className='cd-root pointer-events-auto flex flex-col'
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              onClick={e => e.stopPropagation()}
            >
              {/* ── HEADER ── */}
              <div className='cd-header flex items-center justify-between shrink-0'>
                <div className='flex items-center gap-3'>
                  <div className='relative w-10 h-10 rounded-xl flex items-center justify-center cd-icon-wrap'>
                    <ShoppingCart size={17} strokeWidth={2} className='cd-accent' />
                    {itemCount > 0 && (
                      <motion.span
                        key={itemCount}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className='cd-badge-dot'
                      />
                    )}
                  </div>
                  <div>
                    <h2 className='cd-title'>Cart</h2>
                    <p className='cd-subtitle'>
                      {itemCount === 0 ? 'No items yet' : `${itemCount} item${itemCount !== 1 ? 's' : ''}`}
                    </p>
                  </div>
                </div>
                <button onClick={closeCart} aria-label='Close' className='cd-close-btn'>
                  <X size={16} strokeWidth={2} />
                </button>
              </div>

              {/* ── FREE SHIPPING ── */}
              {items.length > 0 && (
                <div className='cd-ship shrink-0'>
                  <div className='flex items-center gap-2 mb-1.5'>
                    <Truck size={13} strokeWidth={1.5} className={freeShipping ? 'cd-ship-done' : 'cd-ship-muted'} />
                    <span className='cd-ship-text'>
                      {freeShipping
                        ? <span className='cd-ship-done font-semibold'>Free shipping unlocked!</span>
                        : <>Add <span className='font-semibold' style={{ color: 'var(--tx)' }}>${remaining.toFixed(2)}</span> for free shipping</>
                      }
                    </span>
                  </div>
                  <div className='cd-progress-track'>
                    <motion.div
                      className='cd-progress-fill'
                      initial={{ width: 0 }}
                      animate={{ width: `${shippingProgress}%` }}
                      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                </div>
              )}

              {/* ── BODY ── */}
              <div className='flex-1 overflow-y-auto cd-scroll px-4 py-4 space-y-2.5'>
                {items.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='flex flex-col items-center justify-center h-full text-center px-4'
                  >
                    <div className='cd-empty-icon-wrap mb-5'>
                      <ShoppingBag size={28} strokeWidth={1.2} className='cd-accent' />
                    </div>
                    <p className='cd-empty-title'>Nothing here yet</p>
                    <p className='cd-empty-desc'>Explore our latest gadgets and add your favorites</p>
                    <Link href='/products' onClick={closeCart} className='cd-empty-cta'>
                      <Zap size={14} strokeWidth={2} />
                      Browse Products
                    </Link>
                  </motion.div>
                ) : (
                  <AnimatePresence mode='popLayout'>
                    {items.map((item) => (
                      <motion.div
                        key={item.variantSku}
                        layout
                        initial={{ opacity: 0, y: 20, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 80, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 28, stiffness: 350 }}
                        className='cd-item'
                      >
                        <div className='cd-item-img'>
                          {item.image ? (
                            <Image src={item.image} alt={item.name} fill sizes='80px' className='object-cover' unoptimized />
                          ) : (
                            <Package size={22} strokeWidth={1.2} className='cd-item-img-fallback' />
                          )}
                        </div>
                        <div className='flex-1 min-w-0'>
                          <p className='cd-item-name'>{item.name}</p>
                          <p className='cd-item-price'>${item.price.toFixed(2)}</p>
                          <div className='flex items-center gap-2 mt-2'>
                            <div className='cd-qty'>
                              <button onClick={() => item.quantity > 1 ? updateQty(item.variantSku, item.quantity - 1) : removeItem(item.variantSku)} className='cd-qty-btn' aria-label='Decrease'>
                                <Minus size={10} strokeWidth={2.5} />
                              </button>
                              <span className='cd-qty-val'>{item.quantity}</span>
                              <button onClick={() => updateQty(item.variantSku, item.quantity + 1)} className='cd-qty-btn' aria-label='Increase'>
                                <Plus size={10} strokeWidth={2.5} />
                              </button>
                            </div>
                            <span className='cd-item-line'>${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        </div>
                        <button onClick={() => removeItem(item.variantSku)} className='cd-item-remove' aria-label='Remove'>
                          <Trash2 size={13} strokeWidth={1.5} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>

              {/* ── FOOTER ── */}
              {items.length > 0 && (
                <motion.div
                  initial={{ y: 12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className='cd-footer shrink-0'
                >
                  {couponCode && discount > 0 && (
                    <div className='cd-coupon'>
                      <Tag size={12} strokeWidth={2} className='cd-accent' />
                      <span className='cd-coupon-code'>{couponCode}</span>
                      <span className='cd-coupon-val'>−${discount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className='cd-summary'>
                    <div className='cd-summary-row'>
                      <span>Subtotal</span>
                      <span className='font-semibold'>${subtotal.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                      <div className='cd-summary-row' style={{ color: '#22c55e' }}>
                        <span>Discount</span>
                        <span className='font-semibold'>−${discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className='cd-summary-row'>
                      <span>Shipping</span>
                      <span className={freeShipping ? 'text-green-500 font-semibold' : ''}>
                        {freeShipping ? 'Free' : 'TBD'}
                      </span>
                    </div>
                  </div>

                  <div className='cd-total'>
                    <span>Total</span>
                    <motion.span
                      key={total}
                      initial={{ scale: 1.06 }}
                      animate={{ scale: 1 }}
                      className='cd-total-val'
                    >
                      ${total.toFixed(2)}
                    </motion.span>
                  </div>

                  <Link href='/checkout' onClick={closeCart} className='cd-checkout-btn'>
                    <span>Checkout</span>
                    <ArrowRight size={15} strokeWidth={2.5} />
                  </Link>

                  <div className='cd-footer-links'>
                    <button onClick={closeCart} className='cd-footer-link'>
                      <ChevronRight size={12} strokeWidth={2} style={{ transform: 'rotate(180deg)' }} />
                      Keep shopping
                    </button>
                    <Link href='/cart' onClick={closeCart} className='cd-footer-link cd-footer-link-accent'>
                      View full cart
                    </Link>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>

          <style>{`
            .cd-root {
              width: 100%;
              max-width: 460px;
              max-height: 90vh;
              border-radius: 20px;
              background: var(--card);
              border: 1px solid var(--card-bdr);
              box-shadow: 0 20px 60px rgba(0,0,0,0.18);
              overflow: hidden;
            }

            .cd-header {
              padding: 20px 20px 16px;
              border-bottom: 1px solid var(--card-bdr);
            }
            .cd-icon-wrap {
              background: var(--accent-dim);
            }
            .cd-badge-dot {
              position: absolute;
              top: -2px;
              right: -2px;
              width: 9px;
              height: 9px;
              border-radius: 999px;
              background: var(--accent);
              border: 2px solid var(--card);
            }
            .cd-title {
              font-size: 16px;
              font-weight: 700;
              color: var(--tx);
              line-height: 1.2;
            }
            .cd-subtitle {
              font-size: 12px;
              color: var(--tx2);
              margin-top: 1px;
            }
            .cd-close-btn {
              width: 34px;
              height: 34px;
              border-radius: 10px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: var(--tx2);
              transition: background 0.15s, color 0.15s;
              cursor: pointer;
              background: none;
              border: none;
            }
            .cd-close-btn:hover {
              background: var(--surface);
              color: var(--tx);
            }

            .cd-ship {
              padding: 12px 20px 14px;
              background: var(--surface);
              border-bottom: 1px solid var(--card-bdr);
            }
            .cd-ship-muted { color: var(--tx3); }
            .cd-ship-done { color: #22c55e; }
            .cd-ship-text { font-size: 12px; color: var(--tx2); }
            .cd-progress-track {
              height: 4px;
              border-radius: 4px;
              background: var(--card-bdr);
              overflow: hidden;
            }
            .cd-progress-fill {
              height: 100%;
              border-radius: 4px;
              background: linear-gradient(90deg, #6366f1, #8b5cf6);
            }

            .cd-scroll::-webkit-scrollbar { width: 3px; }
            .cd-scroll::-webkit-scrollbar-track { background: transparent; }
            .cd-scroll::-webkit-scrollbar-thumb { background: var(--card-bdr); border-radius: 4px; }

            .cd-empty-icon-wrap {
              width: 72px;
              height: 72px;
              border-radius: 18px;
              background: var(--accent-dim);
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .cd-empty-title {
              font-size: 16px;
              font-weight: 700;
              color: var(--tx);
            }
            .cd-empty-desc {
              font-size: 13px;
              color: var(--tx2);
              margin-top: 4px;
              max-width: 220px;
              line-height: 1.5;
            }
            .cd-empty-cta {
              display: inline-flex;
              align-items: center;
              gap: 8px;
              margin-top: 20px;
              padding: 10px 22px;
              border-radius: 12px;
              font-size: 13px;
              font-weight: 600;
              color: #fff;
              background: linear-gradient(135deg, #6366f1, #8b5cf6);
              box-shadow: 0 4px 16px rgba(99,102,241,0.3);
              transition: box-shadow 0.2s, transform 0.15s;
              text-decoration: none;
            }
            .cd-empty-cta:hover {
              box-shadow: 0 6px 24px rgba(99,102,241,0.45);
            }

            .cd-item {
              display: flex;
              gap: 12px;
              padding: 12px;
              border-radius: 14px;
              background: var(--surface);
              border: 1px solid var(--card-bdr);
              transition: border-color 0.2s, box-shadow 0.2s;
            }
            .cd-item:hover {
              border-color: var(--border-hi);
              box-shadow: 0 2px 12px rgba(99,102,241,0.06);
            }
            .cd-item-img {
              position: relative;
              width: 76px;
              height: 76px;
              border-radius: 12px;
              overflow: hidden;
              background: var(--accent-dim);
              flex-shrink: 0;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .cd-item-img-fallback {
              color: var(--tx3);
            }
            .cd-item-name {
              font-size: 13px;
              font-weight: 600;
              color: var(--tx);
              line-height: 1.3;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              overflow: hidden;
            }
            .cd-item-price {
              font-size: 12px;
              color: var(--tx3);
              margin-top: 1px;
            }
            .cd-qty {
              display: flex;
              align-items: center;
              gap: 0;
              border: 1px solid var(--card-bdr);
              border-radius: 8px;
              overflow: hidden;
              background: var(--card);
            }
            .cd-qty-btn {
              width: 26px;
              height: 26px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: var(--tx2);
              transition: background 0.12s, color 0.12s;
              cursor: pointer;
              background: none;
              border: none;
              font-size: 0;
            }
            .cd-qty-btn:hover {
              background: var(--accent-dim);
              color: var(--accent);
            }
            .cd-qty-val {
              width: 24px;
              text-align: center;
              font-size: 12px;
              font-weight: 700;
              color: var(--tx);
            }
            .cd-item-line {
              font-size: 13px;
              font-weight: 700;
              color: var(--accent);
              margin-left: auto;
            }
            .cd-item-remove {
              width: 28px;
              height: 28px;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: var(--tx3);
              transition: background 0.12s, color 0.12s;
              cursor: pointer;
              background: none;
              border: none;
              flex-shrink: 0;
              align-self: flex-start;
            }
            .cd-item-remove:hover {
              background: rgba(239,68,68,0.1);
              color: #ef4444;
            }

            .cd-footer {
              padding: 16px 20px 20px;
              border-top: 1px solid var(--card-bdr);
              background: var(--card);
            }
            .cd-coupon {
              display: flex;
              align-items: center;
              gap: 8px;
              padding: 10px 14px;
              border-radius: 10px;
              background: var(--accent-dim);
              border: 1px solid rgba(99,102,241,0.12);
              margin-bottom: 12px;
            }
            .cd-coupon-code {
              font-size: 12px;
              font-weight: 700;
              color: var(--accent);
              flex: 1;
            }
            .cd-coupon-val {
              font-size: 12px;
              font-weight: 700;
              color: #22c55e;
            }
            .cd-summary {
              display: flex;
              flex-direction: column;
              gap: 6px;
              margin-bottom: 12px;
            }
            .cd-summary-row {
              display: flex;
              justify-content: space-between;
              font-size: 13px;
              color: var(--tx2);
            }
            .cd-total {
              display: flex;
              justify-content: space-between;
              align-items: baseline;
              padding-top: 12px;
              border-top: 1px solid var(--card-bdr);
              font-size: 14px;
              font-weight: 700;
              color: var(--tx);
              margin-bottom: 16px;
            }
            .cd-total-val {
              font-size: 22px;
              font-weight: 800;
              font-family: var(--font-family-display);
              color: var(--accent);
            }
            .cd-checkout-btn {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 10px;
              width: 100%;
              padding: 14px;
              border-radius: 12px;
              font-size: 14px;
              font-weight: 700;
              color: #fff;
              background: linear-gradient(135deg, #6366f1, #4f46e5);
              box-shadow: 0 4px 20px rgba(99,102,241,0.35);
              transition: box-shadow 0.2s, transform 0.15s;
              text-decoration: none;
              border: none;
              cursor: pointer;
              position: relative;
              overflow: hidden;
            }
            .cd-checkout-btn::before {
              content: '';
              position: absolute;
              inset: 0;
              background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%);
              background-size: 200% 100%;
              animation: cd-shimmer 2.8s infinite;
            }
            .cd-checkout-btn:hover {
              box-shadow: 0 6px 28px rgba(99,102,241,0.5);
            }
            .cd-checkout-btn:active {
              transform: scale(0.98);
            }
            @keyframes cd-shimmer {
              0%   { background-position: 200% 0; }
              100% { background-position: -200% 0; }
            }
            .cd-footer-links {
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-top: 12px;
            }
            .cd-footer-link {
              display: flex;
              align-items: center;
              gap: 4px;
              font-size: 12px;
              font-weight: 500;
              color: var(--tx2);
              text-decoration: none;
              transition: color 0.15s;
              cursor: pointer;
              background: none;
              border: none;
              padding: 0;
            }
            .cd-footer-link:hover {
              color: var(--tx);
            }
            .cd-footer-link-accent {
              color: var(--accent);
              font-weight: 600;
            }
            .cd-footer-link-accent:hover {
              color: var(--accent);
              text-decoration: underline;
            }
          `}</style>
        </>
      )}
    </AnimatePresence>
  );
}
