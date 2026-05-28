'use client';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronLeft, Package, Clock, CheckCircle, Truck, XCircle, Copy, Check, Hash, Calendar } from 'lucide-react';
import Image from 'next/image';
import { useState, useCallback } from 'react';
import { useRequireAuth } from '@/hooks/useAuth';
import PageTransition from '@/components/layout/PageTransition';
import { OrderTimeline } from '@/components/order/OrderTimeline';
import api from '@/lib/axios';
import { formatPrice, formatDate } from '@/lib/utils';

const productColors = ['#6366f1','#8b5cf6','#ec4899','#f43f5e','#f97316','#eab308','#22c55e','#14b8a6','#06b6d4','#3b82f6'];

const statusColor = (status: string) => {
  const map: Record<string, string> = {
    pending: '#f59e0b',
    confirmed: '#3b82f6',
    processing: '#8b5cf6',
    shipped: '#f97316',
    delivered: '#22c55e',
    cancelled: '#ef4444',
  };
  return map[status] || '#6366f1';
};

const statusIcon = (status: string) => {
  const map: Record<string, any> = {
    pending: Clock, confirmed: CheckCircle, processing: Package,
    shipped: Truck, delivered: CheckCircle, cancelled: XCircle,
  };
  return map[status] || Package;
};

function ProductThumb({ name, image, size = 56 }: { name?: string; image?: string; size?: number }) {
  const initial = (name || '?')[0].toUpperCase();
  const hash = name ? name.split('').reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0) : 0;
  const color = productColors[Math.abs(hash) % productColors.length];
  if (image) {
    return (
      <div className='rounded-xl overflow-hidden shrink-0' style={{ width: size, height: size }}>
        <Image src={image} alt='' width={size} height={size} className='object-cover w-full h-full' />
      </div>
    );
  }
  return (
    <div
      className='rounded-xl shrink-0 flex items-center justify-center text-sm font-bold'
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${color}20, ${color}08)`,
        border: `1px solid ${color}30`,
        color,
      }}
    >
      {initial}
    </div>
  );
}

function CopyId({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(() => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [id]);
  return (
    <button onClick={copy}
      className='inline-flex items-center gap-1.5 text-xs font-medium transition-all duration-200 rounded-lg px-2.5 py-1.5'
      style={{
        color: copied ? '#22c55e' : 'var(--tx2)',
        background: copied ? 'rgba(34,197,94,0.1)' : 'var(--surface)',
        border: '1px solid',
        borderColor: copied ? 'rgba(34,197,94,0.2)' : 'var(--border)',
      }}
    >
      {copied ? <Check size={12} strokeWidth={2} /> : <Copy size={12} strokeWidth={1.5} />}
      {copied ? 'Copied' : 'Copy ID'}
    </button>
  );
}

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const fadeItem = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 130, damping: 18 } },
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const { user } = useRequireAuth();

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const { data } = await api.get(`/orders/${id}`);
      return data.data.order;
    },
    enabled: !!user && !!id,
  });

  if (!user) return null;

  if (isLoading) return (
    <PageTransition>
      <section className='min-h-screen' style={{ background: 'var(--bg)' }}>
        <div className='max-w-4xl mx-auto px-4 py-8 lg:py-12'>
          <div className='mb-8 animate-pulse'>
            <div className='h-4 rounded w-36 mb-4' style={{ background: 'var(--border)' }} />
            <div className='h-7 rounded w-48 mb-2' style={{ background: 'var(--border)' }} />
            <div className='flex gap-3 mt-4'>
              <div className='h-5 rounded w-20' style={{ background: 'var(--border)' }} />
              <div className='h-5 rounded w-24' style={{ background: 'var(--border)' }} />
            </div>
          </div>
          <div className='grid lg:grid-cols-3 gap-6'>
            <div className='lg:col-span-2 space-y-4'>
              <div className='rounded-xl animate-pulse p-5' style={{ background: 'var(--card)', border: '1px solid var(--card-bdr)' }}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className='flex items-center gap-4 mb-4 last:mb-0'>
                    <div className='w-14 h-14 rounded-xl' style={{ background: 'var(--border)' }} />
                    <div className='flex-1 space-y-2'>
                      <div className='h-4 rounded w-2/5' style={{ background: 'var(--border)' }} />
                      <div className='h-3 rounded w-1/4' style={{ background: 'var(--border)' }} />
                    </div>
                    <div className='h-4 rounded w-16' style={{ background: 'var(--border)' }} />
                  </div>
                ))}
              </div>
            </div>
            <div className='space-y-4 animate-pulse'>
              <div className='rounded-xl p-5 space-y-3' style={{ background: 'var(--card)', border: '1px solid var(--card-bdr)' }}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className='h-4 rounded' style={{ background: 'var(--border)' }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageTransition>
  );

  const color = order ? statusColor(order.status) : '#6366f1';
  const StatusIcon = order ? statusIcon(order.status) : Package;

  const errorState = (title: string, message: string, link: string, label: string) => (
    <PageTransition>
      <section className='min-h-screen' style={{ background: 'var(--bg)' }}>
        <div className='max-w-3xl mx-auto px-4 py-20 text-center'>
          <div className='w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5'
            style={{ background: '#fee2e2' }}>
            <XCircle size={28} className='text-red-400' strokeWidth={1.5} />
          </div>
          <h2 className='text-lg font-bold mb-1' style={{ color: 'var(--tx)' }}>{title}</h2>
          <p className='text-sm mb-6' style={{ color: 'var(--tx2)' }}>{message}</p>
          <Link href={link}
            className='inline-flex items-center gap-2 font-semibold px-5 py-2.5 rounded-xl text-white transition-all text-sm'
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            {label}
          </Link>
        </div>
      </section>
    </PageTransition>
  );

  if (isError) return errorState('Failed to load order', 'Something went wrong on our end.', '/account/orders', 'Back to orders');
  if (!order) return errorState('Order not found', 'This order does not exist.', '/account/orders', 'Back to orders');

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

        <div className='relative z-10 max-w-4xl mx-auto px-4 py-8 lg:py-12'>
          {/* Back link */}
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className='mb-6'
          >
            <Link href='/account/orders'
              className='inline-flex items-center gap-1.5 text-sm font-medium transition-all duration-200 hover:gap-2'
              style={{ color: 'var(--tx2)' }}
            >
              <ChevronLeft size={15} strokeWidth={1.5} />
              All Orders
            </Link>
          </motion.div>

          {/* Order header */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className='mb-8'
          >
            <div className='flex flex-col sm:flex-row sm:items-start justify-between gap-4'>
              <div>
                <div className='flex items-center gap-2.5 mb-1.5'>
                  <StatusIcon size={18} style={{ color }} strokeWidth={1.5} />
                  <h1 className='font-mono text-xl font-bold tracking-tight' style={{ color: 'var(--tx)' }}>
                    #{order._id.slice(-8).toUpperCase()}
                  </h1>
                  <CopyId id={order._id} />
                </div>
                <div className='flex items-center gap-2 text-sm' style={{ color: 'var(--tx3)' }}>
                  <Calendar size={12} strokeWidth={1.5} />
                  {formatDate(order.createdAt)}
                  <span className='w-1 h-1 rounded-full' style={{ background: 'var(--border)' }} />
                  <span className='font-medium capitalize' style={{ color }}>{order.status}</span>
                </div>
              </div>
            </div>
          </motion.div>

          <div className='grid lg:grid-cols-3 gap-6'>
            {/* Main content */}
            <div className='lg:col-span-2 space-y-5'>
              {/* Order Items */}
              <motion.div
                variants={stagger}
                initial='hidden'
                animate='show'
                className='rounded-xl overflow-hidden'
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--card-bdr)',
                }}
              >
                <div className='px-5 py-3.5' style={{ borderBottom: '1px solid var(--card-bdr)' }}>
                  <h2 className='font-bold text-sm' style={{ color: 'var(--tx)' }}>
                    Items <span style={{ color: 'var(--tx3)' }}>({order.items?.length || 0})</span>
                  </h2>
                </div>
                <div className='divide-y' style={{ borderColor: 'var(--card-bdr)' }}>
                  {order.items?.map((item: any, i: number) => (
                    <motion.div key={i} variants={fadeItem}>
                      <Link href={`/products/${item.slug || item.product}`}
                        className='flex items-center gap-4 px-5 py-4 group'
                      >
                        <ProductThumb name={item.name} image={item.image} size={56} />
                        <div className='flex-1 min-w-0'>
                          <p className='font-semibold text-sm truncate group-hover:underline' style={{ color: 'var(--tx)' }}>{item.name || 'Product'}</p>
                          <p className='text-xs mt-0.5' style={{ color: 'var(--tx3)' }}>
                            {item.variantColor || item.variantStorage ? `${[item.variantColor, item.variantStorage].filter(Boolean).join(' · ')} · ` : ''}
                            SKU: {item.variantSku} &middot; Qty: {item.quantity}
                          </p>
                        </div>
                        <div className='text-right shrink-0'>
                          <p className='font-semibold text-sm' style={{ color: 'var(--tx)' }}>{formatPrice(item.price * item.quantity)}</p>
                          <p className='text-xs' style={{ color: 'var(--tx3)' }}>{formatPrice(item.price)} each</p>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Timeline */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className='rounded-xl p-5'
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--card-bdr)',
                }}
              >
                <h2 className='font-bold text-sm mb-5' style={{ color: 'var(--tx)' }}>Order Status</h2>
                <OrderTimeline
                  currentStatus={
                    order.status === 'confirmed' ? 'Confirmed' :
                    order.status === 'shipped' ? 'Shipped' :
                    order.status === 'delivered' ? 'Delivered' :
                    order.status === 'processing' ? 'Processing' :
                    'Confirmed'
                  }
                />
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className='space-y-4'>
              <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: 'spring', stiffness: 110, damping: 20 }}
                className='rounded-xl p-5'
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--card-bdr)',
                }}
              >
                <h2 className='font-bold text-sm mb-4' style={{ color: 'var(--tx)' }}>Order Info</h2>
                <div className='space-y-2.5 text-sm'>
                  {[
                    { label: 'Order ID', value: `#${order._id.slice(-8).toUpperCase()}`, mono: true },
                    { label: 'Date', value: formatDate(order.createdAt) },
                    {
                      label: 'Status',
                      value: (
                        <span className='text-xs font-semibold px-2 py-0.5 rounded capitalize'
                          style={{ background: `${color}15`, color, boxShadow: `0 0 8px ${color}15` }}>
                          {order.status}
                        </span>
                      ),
                    },
                    { label: 'Shipping', value: order.shippingMethod || 'Standard', capitalize: true },
                  ].map(row => (
                    <div key={row.label} className='flex justify-between items-center'>
                      <span style={{ color: 'var(--tx3)' }}>{row.label}</span>
                      {typeof row.value === 'string' ? (
                        <span className={`font-medium ${row.mono ? 'font-mono text-xs' : ''} ${row.capitalize ? 'capitalize' : ''}`}
                          style={{ color: 'var(--tx)' }}>
                          {row.value}
                        </span>
                      ) : row.value}
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: 'spring', stiffness: 110, damping: 20, delay: 0.07 }}
                className='rounded-xl p-5'
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--card-bdr)',
                }}
              >
                <h2 className='font-bold text-sm mb-4' style={{ color: 'var(--tx)' }}>Summary</h2>
                <motion.div variants={stagger} initial='hidden' animate='show' className='space-y-2 text-sm'>
                  {[
                    { label: 'Subtotal', value: formatPrice(order.subtotal || order.total) },
                    ...(order.discount > 0 ? [{ label: 'Discount', value: `-${formatPrice(order.discount)}`, green: true }] : []),
                    { label: 'Shipping', value: formatPrice(order.shippingCost || 0) },
                  ].map((row: any) => (
                    <motion.div key={row.label} variants={fadeItem} className='flex justify-between'>
                      <span style={{ color: row.green ? '#22c55e' : 'var(--tx3)' }}>{row.label}</span>
                      <span style={{ color: row.green ? '#22c55e' : 'var(--tx)' }}>{row.value}</span>
                    </motion.div>
                  ))}
                  <motion.div
                    variants={fadeItem}
                    className='flex justify-between font-bold text-base pt-3'
                    style={{ borderTop: '1px solid var(--card-bdr)' }}
                  >
                    <span style={{ color: 'var(--tx)' }}>Total</span>
                    <motion.span
                      style={{ color }}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 160, damping: 14, delay: 0.25 }}
                    >
                      {formatPrice(order.total)}
                    </motion.span>
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
