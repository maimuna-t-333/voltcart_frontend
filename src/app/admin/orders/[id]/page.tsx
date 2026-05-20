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
  pending:          'bg-yellow-100 text-yellow-700',
  confirmed:        'bg-blue-100 text-blue-700',
  processing:       'bg-purple-100 text-purple-700',
  shipped:          'bg-indigo-100 text-indigo-700',
  out_for_delivery: 'bg-cyan-100 text-cyan-700',
  delivered:        'bg-green-100 text-green-700',
  cancelled:        'bg-red-100 text-red-700',
  refunded:         'bg-gray-100 text-gray-600',
};

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
      <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500' />
    </div>
  );

  if (!order) return <div className='p-8 text-center text-gray-400'>Order not found</div>;

  return (
    <PageTransition>
      <div className='max-w-5xl mx-auto px-4 py-8'>
        {/* Header */}
        <div className='flex items-center gap-4 mb-8'>
          <Link href='/admin/orders' className='text-gray-400 hover:text-gray-600'>
            <ArrowLeft size={20} />
          </Link>
          <div className='flex-1'>
            <div className='flex items-center gap-3'>
              <h1 className='text-2xl font-bold text-gray-900'>
                Order #{order._id.slice(-8).toUpperCase()}
              </h1>
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${STATUS_COLORS[order.status]}`}>
                {order.status.replace('_', ' ')}
              </span>
            </div>
            <p className='text-gray-500 text-sm mt-1'>
              Placed {new Date(order.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
          </div>
        </div>

        <div className='grid lg:grid-cols-3 gap-6'>
          {/* Left column */}
          <div className='lg:col-span-2 space-y-6'>

            {/* Order Items */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className='bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden'>
              <div className='flex items-center gap-3 p-5 border-b border-gray-100'>
                <Package size={18} className='text-gray-400' />
                <h2 className='font-semibold text-gray-900'>Items ({order.items?.length})</h2>
              </div>
              <div className='divide-y divide-gray-50'>
                {order.items?.map((item: any, i: number) => (
                  <div key={i} className='flex items-center gap-4 p-4'>
                    {item.image ? (
                      <img src={item.image} alt={item.name} className='w-14 h-14 rounded-xl object-cover bg-gray-100' />
                    ) : (
                      <div className='w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center text-2xl'>📦</div>
                    )}
                    <div className='flex-1 min-w-0'>
                      <p className='font-medium text-gray-900 truncate'>{item.name}</p>
                      {item.variantSku && <p className='text-xs text-gray-400'>SKU: {item.variantSku}</p>}
                      <p className='text-sm text-gray-500'>Qty: {item.quantity}</p>
                    </div>
                    <p className='font-semibold text-gray-900'>{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Status History */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className='bg-white border border-gray-100 rounded-2xl shadow-sm p-5'>
              <div className='flex items-center gap-3 mb-4'>
                <Clock size={18} className='text-gray-400' />
                <h2 className='font-semibold text-gray-900'>Status History</h2>
              </div>
              {order.statusHistory?.length === 0 ? (
                <p className='text-sm text-gray-400'>No history yet</p>
              ) : (
                <div className='space-y-3'>
                  {[...order.statusHistory].reverse().map((h: any, i: number) => (
                    <div key={i} className='flex items-start gap-3'>
                      <div className='w-2 h-2 rounded-full bg-brand-500 mt-1.5 shrink-0' />
                      <div>
                        <p className='text-sm font-medium text-gray-900 capitalize'>{h.status?.replace('_', ' ')}</p>
                        <p className='text-xs text-gray-400'>{h.note}</p>
                        <p className='text-xs text-gray-300'>{new Date(h.updatedAt).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Right column */}
          <div className='space-y-6'>

            {/* Update Status */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className='bg-white border border-gray-100 rounded-2xl shadow-sm p-5'>
              <h2 className='font-semibold text-gray-900 mb-4'>Update Status</h2>
              <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 mb-3'>
                <option value=''>Select new status...</option>
                {STATUSES.filter(s => s !== order.status).map(s => (
                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                ))}
              </select>
              <button
                onClick={() => newStatus && statusMutation.mutate(newStatus)}
                disabled={!newStatus || statusMutation.isPending}
                className='w-full py-2.5 bg-brand-500 text-white font-semibold rounded-xl hover:bg-brand-600 transition-colors disabled:opacity-50 text-sm'>
                {statusMutation.isPending ? 'Updating...' : 'Update Status'}
              </button>
            </motion.div>

            {/* Order Summary */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className='bg-white border border-gray-100 rounded-2xl shadow-sm p-5'>
              <div className='flex items-center gap-3 mb-4'>
                <CreditCard size={18} className='text-gray-400' />
                <h2 className='font-semibold text-gray-900'>Summary</h2>
              </div>
              <div className='space-y-2 text-sm'>
                <div className='flex justify-between text-gray-600'><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
                {order.discount > 0 && <div className='flex justify-between text-green-600'><span>Discount</span><span>-{formatPrice(order.discount)}</span></div>}
                {order.couponCode && <div className='flex justify-between text-gray-400 text-xs'><span>Coupon</span><span>{order.couponCode}</span></div>}
                <div className='flex justify-between text-gray-600'><span>Shipping</span><span>{formatPrice(order.shippingCost)}</span></div>
                <div className='flex justify-between text-gray-600'><span>Tax</span><span>{formatPrice(order.tax)}</span></div>
                <div className='flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100 text-base'>
                  <span>Total</span><span>{formatPrice(order.total)}</span>
                </div>
              </div>
              {order.stripePaymentIntentId && (
                <p className='text-xs text-gray-400 mt-3 font-mono break-all'>PI: {order.stripePaymentIntentId}</p>
              )}
            </motion.div>

            {/* Customer */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className='bg-white border border-gray-100 rounded-2xl shadow-sm p-5'>
              <h2 className='font-semibold text-gray-900 mb-3'>Customer</h2>
              <p className='text-sm font-medium text-gray-900'>{order.user?.name ?? 'Guest'}</p>
              <p className='text-sm text-gray-500'>{order.user?.email ?? order.guestEmail}</p>
            </motion.div>

            {/* Shipping Address */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className='bg-white border border-gray-100 rounded-2xl shadow-sm p-5'>
              <div className='flex items-center gap-3 mb-3'>
                <MapPin size={18} className='text-gray-400' />
                <h2 className='font-semibold text-gray-900'>Shipping</h2>
              </div>
              {order.shippingAddress ? (
                <div className='text-sm text-gray-600 space-y-0.5'>
                  <p>{order.shippingAddress.line1}</p>
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
                  <p>{order.shippingAddress.country}</p>
                  {order.shippingMethod && <p className='text-gray-400 capitalize mt-1'>{order.shippingMethod} shipping</p>}
                  {order.trackingNumber && <p className='text-gray-400 mt-1'>Tracking: <span className='font-mono'>{order.trackingNumber}</span></p>}
                </div>
              ) : (
                <p className='text-sm text-gray-400'>No address provided</p>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}