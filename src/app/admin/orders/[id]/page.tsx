'use client';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Package, MapPin, Clock, CreditCard } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import PageTransition from '@/components/layout/PageTransition';
import { useRequireAdmin } from '@/hooks/useAuth';
import api from '@/lib/axios';
import { formatPrice } from '@/lib/utils';

const STATUSES = ['pending','confirmed','processing','shipped','out_for_delivery','delivered','cancelled','refunded'];

const STATUS_COLORS: Record<string, string> = {
  pending:          '#f59e0b',
  confirmed:        '#3b82f6',
  processing:       '#8b5cf6',
  shipped:          '#f97316',
  out_for_delivery: '#06b6d4',
  delivered:        '#22c55e',
  cancelled:        '#ef4444',
  refunded:         '#6b7280',
};

const productColors = ['#6366f1','#8b5cf6','#ec4899','#f43f5e','#f97316','#22c55e','#14b8a6','#3b82f6'];

function ProductThumb({ name }: { name: string }) {
  const initial = name[0].toUpperCase();
  const hash = name.split('').reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0);
  const color = productColors[Math.abs(hash) % productColors.length];
  return (
    <div className='w-11 h-11 rounded-xl flex items-center justify-center text-xs font-bold shrink-0'
      style={{ background: `${color}12`, color }}>
      {initial}
    </div>
  );
}

export default function AdminOrderDetailPage() {
  const { user } = useRequireAdmin();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [newStatus, setNewStatus] = useState('');

  const { data: order, isLoading } = useQuery({
    queryKey: ['admin', 'order', id],
    queryFn: async () => {
      const { data } = await api.get(`/orders/${id}`);
      return data.data.order;
    },
    enabled: !!id && !!user,
  });

  const statusMutation = useMutation({
    mutationFn: (status: string) => api.patch(`/orders/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'order', id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      toast.success('Order status updated');
      setNewStatus('');
    },
    onError: () => toast.error('Failed to update status'),
  });

  if (!user || user.role !== 'admin') return null;

  if (isLoading) return (
    <div className='min-h-screen flex items-center justify-center'>
      <div className='animate-spin rounded-full h-8 w-8 border-b-2' style={{ borderColor: '#6366f1' }} />
    </div>
  );

  if (!order) return (
    <div className='p-12 text-center text-sm' style={{ color: 'var(--tx3)' }}>Order not found</div>
  );

  return (
    <PageTransition>
      <div className='max-w-5xl mx-auto p-6 lg:p-8'>
        {/* Header */}
        <div className='flex items-center gap-4 mb-6'>
          <Link href='/admin/orders' className='transition-all' style={{ color: 'var(--tx3)' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#6366f1'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--tx3)'; }}>
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className='flex items-center gap-3'>
              <h1 className='text-xl font-bold' style={{ color: 'var(--tx)' }}>
                Order #{order._id.slice(-8).toUpperCase()}
              </h1>
              <span className='text-[10px] font-semibold px-2 py-0.5 rounded capitalize'
                style={{
                  background: `${STATUS_COLORS[order.status] || '#6b7280'}12`,
                  color: STATUS_COLORS[order.status] || '#6b7280',
                }}>
                {order.status.replace('_', ' ')}
              </span>
            </div>
            <p className='text-sm mt-0.5' style={{ color: 'var(--tx3)' }}>
              Placed {new Date(order.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
          </div>
        </div>

        <div className='grid lg:grid-cols-3 gap-6'>
          {/* Left column */}
          <div className='lg:col-span-2 space-y-6'>

            {/* Order Items */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className='rounded-xl overflow-hidden' style={{ background: 'var(--card)', border: '1px solid var(--card-bdr)' }}>
              <div className='flex items-center gap-3 px-5 py-3.5 text-sm font-semibold' style={{ color: 'var(--tx)', borderBottom: '1px solid var(--card-bdr)', background: 'var(--surface)' }}>
                <Package size={16} strokeWidth={1.5} style={{ color: 'var(--tx3)' }} />
                Items ({order.items?.length})
              </div>
              <div className='divide-y' style={{ borderColor: 'var(--card-bdr)' }}>
                {order.items?.map((item: any, i: number) => (
                  <div key={i} className='flex items-center gap-4 px-5 py-3.5'>
                    <ProductThumb name={item.name} />
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-medium truncate' style={{ color: 'var(--tx)' }}>{item.name}</p>
                      {item.variantSku && (
                        <p className='text-xs mt-0.5' style={{ color: 'var(--tx3)' }}>SKU: {item.variantSku} · Qty: {item.quantity}</p>
                      )}
                    </div>
                    <p className='text-sm font-semibold' style={{ color: 'var(--tx)' }}>{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Status History */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className='rounded-xl p-5' style={{ background: 'var(--card)', border: '1px solid var(--card-bdr)' }}>
              <div className='flex items-center gap-3 mb-4'>
                <Clock size={16} strokeWidth={1.5} style={{ color: 'var(--tx3)' }} />
                <h2 className='text-sm font-semibold' style={{ color: 'var(--tx)' }}>Status History</h2>
              </div>
              {(!order.statusHistory || order.statusHistory.length === 0) ? (
                <p className='text-sm' style={{ color: 'var(--tx3)' }}>No history yet</p>
              ) : (
                <div className='space-y-3'>
                  {[...order.statusHistory].reverse().map((h: any, i: number) => (
                    <div key={i} className='flex items-start gap-3'>
                      <div className='w-2 h-2 rounded-full mt-1.5 shrink-0' style={{ background: '#6366f1' }} />
                      <div>
                        <p className='text-sm font-medium capitalize' style={{ color: 'var(--tx)' }}>{h.status?.replace('_', ' ')}</p>
                        {h.note && <p className='text-xs' style={{ color: 'var(--tx3)' }}>{h.note}</p>}
                        <p className='text-xs' style={{ color: 'var(--tx3)' }}>{new Date(h.updatedAt).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Right column */}
          <div className='space-y-5'>

            {/* Update Status */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className='rounded-xl p-5' style={{ background: 'var(--card)', border: '1px solid var(--card-bdr)' }}>
              <h2 className='text-sm font-semibold mb-3' style={{ color: 'var(--tx)' }}>Update Status</h2>
              <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
                className='w-full px-3 py-2 rounded-lg text-sm outline-none transition-all mb-3'
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--card-bdr)',
                  color: 'var(--tx)',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'var(--card-bdr)'; e.currentTarget.style.boxShadow = 'none'; }}>
                <option value=''>Select new status...</option>
                {STATUSES.filter(s => s !== order.status).map(s => (
                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                ))}
              </select>
              <button
                onClick={() => newStatus && statusMutation.mutate(newStatus)}
                disabled={!newStatus || statusMutation.isPending}
                className='w-full py-2.5 rounded-xl font-semibold text-white text-sm transition-all disabled:opacity-40'
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                {statusMutation.isPending ? 'Updating...' : 'Update Status'}
              </button>
            </motion.div>

            {/* Order Summary */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className='rounded-xl p-5' style={{ background: 'var(--card)', border: '1px solid var(--card-bdr)' }}>
              <div className='flex items-center gap-3 mb-4'>
                <CreditCard size={16} strokeWidth={1.5} style={{ color: 'var(--tx3)' }} />
                <h2 className='text-sm font-semibold' style={{ color: 'var(--tx)' }}>Summary</h2>
              </div>
              <div className='space-y-2 text-sm'>
                <div className='flex justify-between' style={{ color: 'var(--tx2)' }}>
                  <span>Subtotal</span><span style={{ color: 'var(--tx)' }}>{formatPrice(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className='flex justify-between' style={{ color: '#22c55e' }}>
                    <span>Discount</span><span>-{formatPrice(order.discount)}</span>
                  </div>
                )}
                {order.couponCode && (
                  <div className='flex justify-between text-xs' style={{ color: 'var(--tx3)' }}>
                    <span>Coupon</span><span>{order.couponCode}</span>
                  </div>
                )}
                <div className='flex justify-between' style={{ color: 'var(--tx2)' }}>
                  <span>Shipping</span><span style={{ color: 'var(--tx)' }}>{formatPrice(order.shippingCost)}</span>
                </div>
                <div className='flex justify-between' style={{ color: 'var(--tx2)' }}>
                  <span>Tax</span><span style={{ color: 'var(--tx)' }}>{formatPrice(order.tax)}</span>
                </div>
                <div className='flex justify-between text-base font-bold pt-2' style={{ color: 'var(--tx)', borderTop: '1px solid var(--card-bdr)' }}>
                  <span>Total</span><span>{formatPrice(order.total)}</span>
                </div>
              </div>
              {order.stripePaymentIntentId && (
                <p className='text-xs mt-3 font-mono break-all' style={{ color: 'var(--tx3)' }}>PI: {order.stripePaymentIntentId}</p>
              )}
            </motion.div>

            {/* Customer */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className='rounded-xl p-5' style={{ background: 'var(--card)', border: '1px solid var(--card-bdr)' }}>
              <h2 className='text-sm font-semibold mb-3' style={{ color: 'var(--tx)' }}>Customer</h2>
              <p className='text-sm font-medium' style={{ color: 'var(--tx)' }}>{order.user?.name ?? 'Guest'}</p>
              <p className='text-sm' style={{ color: 'var(--tx2)' }}>{order.user?.email ?? order.guestEmail}</p>
            </motion.div>

            {/* Shipping Address */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className='rounded-xl p-5' style={{ background: 'var(--card)', border: '1px solid var(--card-bdr)' }}>
              <div className='flex items-center gap-3 mb-3'>
                <MapPin size={16} strokeWidth={1.5} style={{ color: 'var(--tx3)' }} />
                <h2 className='text-sm font-semibold' style={{ color: 'var(--tx)' }}>Shipping</h2>
              </div>
              {order.shippingAddress ? (
                <div className='text-sm space-y-0.5' style={{ color: 'var(--tx2)' }}>
                  <p>{order.shippingAddress.line1}</p>
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
                  <p>{order.shippingAddress.country}</p>
                  {order.shippingMethod && (
                    <p className='capitalize mt-1' style={{ color: 'var(--tx3)' }}>{order.shippingMethod} shipping</p>
                  )}
                  {order.trackingNumber && (
                    <p className='mt-1' style={{ color: 'var(--tx3)' }}>
                      Tracking: <span className='font-mono'>{order.trackingNumber}</span>
                    </p>
                  )}
                </div>
              ) : (
                <p className='text-sm' style={{ color: 'var(--tx3)' }}>No address provided</p>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
