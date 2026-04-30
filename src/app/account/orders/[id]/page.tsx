'use client';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronRight, Package, CheckCircle, Truck, Clock, XCircle } from 'lucide-react';
import { useRequireAuth } from '@/hooks/useAuth';
import PageTransition from '@/components/layout/PageTransition';
import { OrderTimeline } from '@/components/order/OrderTimeline';
import api from '@/lib/axios';
import { formatPrice, formatDate } from '@/lib/utils';

export default function OrderDetailPage() {
  const { id } = useParams();
  const { user } = useRequireAuth();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const { data } = await api.get(`/orders/${id}`);
      return data.data.order;
    },
    enabled: !!user && !!id,
  });

  if (!user) return null;

  if (isLoading) return (
    <div className='max-w-3xl mx-auto px-4 py-8 animate-pulse'>
      <div className='h-8 bg-gray-200 rounded w-1/3 mb-8' />
      <div className='bg-white rounded-2xl p-6 space-y-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className='h-4 bg-gray-200 rounded' />
        ))}
      </div>
    </div>
  );

  if (!order) return (
    <div className='text-center py-20'>
      <p className='text-6xl mb-4'>😕</p>
      <h2 className='text-xl font-bold'>Order not found</h2>
      <Link href='/account/orders' className='text-brand-500 hover:underline mt-4 block'>
        Back to orders
      </Link>
    </div>
  );

  return (
    <PageTransition>
      <div className='max-w-3xl mx-auto px-4 py-8'>
        {/* Breadcrumb */}
        <div className='flex items-center gap-2 text-sm text-gray-500 mb-8'>
          <Link href='/account' className='hover:text-brand-500'>Account</Link>
          <ChevronRight size={14} />
          <Link href='/account/orders' className='hover:text-brand-500'>Orders</Link>
          <ChevronRight size={14} />
          <span className='text-gray-900 font-medium'>#{order._id.slice(-8).toUpperCase()}</span>
        </div>

        <div className='grid md:grid-cols-3 gap-6'>
          {/* Main content */}
          <div className='md:col-span-2 space-y-6'>
            {/* Order items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className='bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden'
            >
              <div className='p-5 border-b border-gray-100'>
                <h2 className='font-bold text-gray-900'>Order Items</h2>
              </div>
              <div className='divide-y divide-gray-50'>
                {order.items?.map((item: any, i: number) => (
                  <div key={i} className='flex gap-4 p-5'>
                    <div className='w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0'>
                      📦
                    </div>
                    <div className='flex-1'>
                      <p className='font-medium text-gray-900'>{item.name || 'Product'}</p>
                      <p className='text-gray-500 text-sm'>SKU: {item.variantSku}</p>
                      <p className='text-gray-500 text-sm'>Qty: {item.quantity}</p>
                    </div>
                    <p className='font-bold text-gray-900'>{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Order Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className='bg-white border border-gray-100 rounded-2xl p-6 shadow-sm'
            >
              <h2 className='font-bold text-gray-900 mb-6'>Order Status</h2>
              <OrderTimeline currentStatus={order.status === 'confirmed' ? 'Confirmed' : order.status === 'shipped' ? 'Shipped' : order.status === 'delivered' ? 'Delivered' : 'Confirmed'} />
            </motion.div>
          </div>

          {/* Summary sidebar */}
          <div className='space-y-6'>
            {/* Order info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className='bg-white border border-gray-100 rounded-2xl p-5 shadow-sm'
            >
              <h2 className='font-bold text-gray-900 mb-4'>Order Info</h2>
              <div className='space-y-3 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-gray-500'>Order ID</span>
                  <span className='font-mono font-medium'>#{order._id.slice(-8).toUpperCase()}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-500'>Date</span>
                  <span className='font-medium'>{formatDate(order.createdAt)}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-500'>Status</span>
                  <span className='font-medium capitalize text-brand-600'>{order.status}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-500'>Shipping</span>
                  <span className='font-medium capitalize'>{order.shippingMethod || 'Standard'}</span>
                </div>
              </div>
            </motion.div>

            {/* Price summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className='bg-white border border-gray-100 rounded-2xl p-5 shadow-sm'
            >
              <h2 className='font-bold text-gray-900 mb-4'>Summary</h2>
              <div className='space-y-2 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-gray-500'>Subtotal</span>
                  <span>{formatPrice(order.subtotal || order.total)}</span>
                </div>
                {order.discount > 0 && (
                  <div className='flex justify-between text-green-600'>
                    <span>Discount</span>
                    <span>-{formatPrice(order.discount)}</span>
                  </div>
                )}
                <div className='flex justify-between'>
                  <span className='text-gray-500'>Shipping</span>
                  <span>{formatPrice(order.shippingCost || 0)}</span>
                </div>
                <div className='border-t border-gray-100 pt-2 flex justify-between font-bold text-base'>
                  <span>Total</span>
                  <span className='text-brand-600'>{formatPrice(order.total)}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
