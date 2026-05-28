'use client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Clock, CheckCircle, Truck, XCircle, Copy, Check, Hash, Calendar, ChevronRight, Package } from 'lucide-react';
import Image from 'next/image';
import { useState, useCallback } from 'react';
import { useRequireAuth } from '@/hooks/useAuth';
import PageTransition from '@/components/layout/PageTransition';
import api from '@/lib/axios';
import { formatPrice, formatDate } from '@/lib/utils';

const productColors = ['#6366f1','#8b5cf6','#ec4899','#f43f5e','#f97316','#eab308','#22c55e','#14b8a6','#06b6d4','#3b82f6'];

const statusConfig: Record<string, { icon: any; label: string; color: string }> = {
  pending:    { icon: Clock,       label: 'Pending',    color: '#f59e0b' },
  confirmed:  { icon: CheckCircle, label: 'Confirmed',  color: '#3b82f6' },
  processing: { icon: Package,     label: 'Processing', color: '#8b5cf6' },
  shipped:    { icon: Truck,       label: 'Shipped',    color: '#f97316' },
  delivered:  { icon: CheckCircle, label: 'Delivered',  color: '#22c55e' },
  cancelled:  { icon: XCircle,     label: 'Cancelled',  color: '#ef4444' },
};

function ProductThumb({ name, image }: { name?: string; image?: string }) {
  const initial = (name || '?')[0].toUpperCase();
  const color = productColors[name ? name.split('').reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0) : 0];
  if (image) {
    return (
      <div className='w-12 h-12 rounded-xl overflow-hidden border-2 shrink-0' style={{ borderColor: 'var(--card-bdr)' }}>
        <Image src={image} alt='' width={48} height={48} className='object-cover w-full h-full' />
      </div>
    );
  }
  return (
    <div
      className='w-12 h-12 rounded-xl border-2 shrink-0 flex items-center justify-center text-sm font-bold'
      style={{
        background: `linear-gradient(135deg, ${color}20, ${color}08)`,
        borderColor: `${color}30`,
        color,
      }}
    >
      {initial}
    </div>
  );
}

function OrderItemRow({ item }: { item: any }) {
  const router = useRouter();
  return (
    <div role='button' tabIndex={0}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push(`/products/${item.slug || item.product}`); }}
      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); router.push(`/products/${item.slug || item.product}`); }}}
      className='flex items-center gap-3 group cursor-pointer'
    >
      <ProductThumb name={item.name} image={item.image} />
      <div className='flex-1 min-w-0'>
        <p className='text-sm font-semibold truncate group-hover:underline' style={{ color: 'var(--tx)' }}>
          {item.name || 'Product'}
        </p>
        <p className='text-xs mt-0.5' style={{ color: 'var(--tx3)' }}>
          {item.variantColor || item.variantStorage ? `${[item.variantColor, item.variantStorage].filter(Boolean).join(' · ')} · ` : ''}
          Qty: {item.quantity} &middot; {formatPrice(item.price)} each
        </p>
      </div>
      <span className='text-sm font-bold shrink-0' style={{ color: 'var(--tx)' }}>
        {formatPrice(item.price * item.quantity)}
      </span>
    </div>
  );
}

function OrderId({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);
  const short = `#${id.slice(-8).toUpperCase()}`;
  const copy = useCallback(() => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [id]);
  return (
    <span className='inline-flex items-center gap-1.5'>
      <span className='font-mono text-sm font-bold tracking-tight' style={{ color: 'var(--tx)' }}>{short}</span>
      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); copy(); }}
        className='transition-all duration-200 p-0.5 rounded'
        style={{ color: copied ? '#22c55e' : 'var(--tx3)' }}
      >
        {copied ? <Check size={11} strokeWidth={2} /> : <Copy size={11} strokeWidth={1.5} />}
      </button>
    </span>
  );
}

export default function OrdersPage() {
  const { user } = useRequireAuth();

  const { data: orders, isLoading, isError } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: async () => {
      const { data } = await api.get('/orders/my-orders');
      return data.data.orders;
    },
    enabled: !!user,
  });

  if (!user) return null;

  return (
    <PageTransition>
      <section className='relative min-h-screen' style={{ background: 'var(--bg)' }}>
        <div className='fixed inset-0 pointer-events-none opacity-[0.015]'
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, var(--tx) 1px, transparent 0)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className='fixed inset-0 pointer-events-none'
          style={{
            background: 'linear-gradient(180deg, transparent 0%, var(--accent-dim) 50%, transparent 100%)',
            opacity: 0.3,
          }}
        />

        <div className='relative z-10 max-w-3xl mx-auto px-4 py-8 lg:py-12'>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className='mb-8'
          >
            <Link href='/account'
              className='inline-flex items-center gap-1 text-xs uppercase tracking-wider mb-3 transition-colors'
              style={{ color: 'var(--tx3)' }}
            >
              Account <ChevronRight size={10} strokeWidth={1.5} />{' '}
              <span style={{ color: 'var(--tx2)' }}>Orders</span>
            </Link>
            <h1 className='text-2xl font-extrabold tracking-tight' style={{ color: 'var(--tx)', fontFamily: 'var(--font-family-display)' }}>
              Order History
            </h1>
            {orders && orders.length > 0 && (
              <p className='text-sm mt-1' style={{ color: 'var(--tx3)' }}>{orders.length} {orders.length === 1 ? 'order' : 'orders'}</p>
            )}
          </motion.div>

          {isLoading ? (
            <div className='space-y-4'>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className='animate-pulse rounded-xl p-5' style={{ background: 'var(--card)', border: '1px solid var(--card-bdr)' }}>
                  <div className='flex items-center justify-between mb-4'>
                    <div className='h-4 rounded w-28' style={{ background: 'var(--border)' }} />
                    <div className='h-6 rounded-full w-20' style={{ background: 'var(--border)' }} />
                  </div>
                  <div className='flex gap-2 mb-4'>
                    <div className='w-12 h-12 rounded-xl' style={{ background: 'var(--border)' }} />
                    <div className='flex-1 space-y-2'>
                      <div className='h-3 rounded w-3/5' style={{ background: 'var(--border)' }} />
                      <div className='h-3 rounded w-2/5' style={{ background: 'var(--border)' }} />
                    </div>
                  </div>
                  <div className='h-px w-full my-3' style={{ background: 'var(--border)' }} />
                  <div className='flex justify-between'>
                    <div className='h-3 rounded w-12' style={{ background: 'var(--border)' }} />
                    <div className='h-4 rounded w-16' style={{ background: 'var(--border)' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className='text-center py-16'
            >
              <div className='w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5'
                style={{ background: '#fee2e2' }}>
                <XCircle size={28} className='text-red-400' strokeWidth={1.5} />
              </div>
              <h2 className='text-lg font-bold mb-1' style={{ color: 'var(--tx)' }}>Couldn't load orders</h2>
              <p className='text-sm mb-6' style={{ color: 'var(--tx2)' }}>Something went wrong on our end</p>
              <button onClick={() => window.location.reload()}
                className='inline-flex items-center gap-2 font-semibold px-5 py-2.5 rounded-xl text-white transition-all text-sm'
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
              >
                Retry
              </button>
            </motion.div>
          ) : !orders || orders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className='text-center py-16'
            >
              <div className='w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5'
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <ShoppingBag size={32} style={{ color: 'var(--tx3)' }} strokeWidth={1.5} />
              </div>
              <h2 className='text-lg font-bold mb-1' style={{ color: 'var(--tx)' }}>No orders yet</h2>
              <p className='text-sm mb-6' style={{ color: 'var(--tx2)' }}>Your first order is just a click away</p>
              <Link href='/products'
                className='inline-flex items-center gap-2 font-semibold px-5 py-2.5 rounded-xl text-white transition-all text-sm'
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
              >
                Browse Products
              </Link>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='space-y-4'>
              {orders.map((order: any, i: number) => {
                const s = statusConfig[order.status] || statusConfig.pending;
                const StatusIcon = s.icon;
                const items = order.items || [];

                return (
                  <motion.div
                    key={order._id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, type: 'spring', stiffness: 140, damping: 20 }}
                  >
                    <Link href={`/account/orders/${order._id}`}
                      className='block rounded-xl overflow-hidden transition-all duration-200'
                      style={{
                        background: 'var(--card)',
                        border: '1px solid var(--card-bdr)',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = `${s.color}40`;
                        e.currentTarget.style.boxShadow = `0 4px 20px ${s.color}08`;
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'var(--card-bdr)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      {/* Order header bar */}
                      <div className='flex items-center justify-between px-5 py-3.5'
                        style={{ borderBottom: '1px solid var(--card-bdr)' }}>
                        <div className='flex items-center gap-2'>
                          <StatusIcon size={14} style={{ color: s.color }} strokeWidth={1.5} />
                          <OrderId id={order._id} />
                        </div>
                        <span
                          className='text-[11px] font-semibold px-2.5 py-0.5 rounded-full'
                          style={{ background: `${s.color}12`, color: s.color }}
                        >
                          {s.label}
                        </span>
                      </div>

                      {/* Products */}
                      <div className='px-5 py-4 space-y-3'>
                        {items.slice(0, 2).map((item: any, j: number) => (
                          <OrderItemRow key={j} item={item} />
                        ))}
                        {items.length > 2 && (
                          <div className='flex items-center gap-2 text-xs font-medium' style={{ color: 'var(--tx3)' }}>
                            <div className='w-12 h-12 rounded-xl border-2 border-dashed flex items-center justify-center shrink-0'
                              style={{ borderColor: 'var(--border)' }}>
                              <span>+{items.length - 2}</span>
                            </div>
                            <span>{items.length - 2} more {items.length - 2 === 1 ? 'item' : 'items'}</span>
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className='flex items-center justify-between px-5 py-3'
                        style={{ borderTop: '1px solid var(--card-bdr)', background: 'var(--surface)' }}>
                        <span className='flex items-center gap-1.5 text-xs' style={{ color: 'var(--tx3)' }}>
                          <Calendar size={11} strokeWidth={1.5} />
                          {formatDate(order.createdAt)}
                        </span>
                        <div className='flex items-center gap-2'>
                          <span className='text-[11px]' style={{ color: 'var(--tx3)' }}>Total</span>
                          <span className='font-extrabold text-sm' style={{ color: 'var(--tx)' }}>
                            {formatPrice(order.total)}
                          </span>
                          <ChevronRight size={14} style={{ color: s.color }} strokeWidth={2} />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </section>
    </PageTransition>
  );
}
