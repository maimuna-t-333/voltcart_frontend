'use client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ShoppingBag, ChevronRight, Package, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';
import { useRequireAuth } from '@/hooks/useAuth';
import PageTransition from '@/components/layout/PageTransition';
import api from '@/lib/axios';
import { formatPrice, formatDate } from '@/lib/utils';

const statusConfig: Record<string, { icon: any; color: string; bg: string; label: string }> = {
  pending:    { icon: Clock,        color: 'text-yellow-600', bg: 'bg-yellow-50',  label: 'Pending' },
  confirmed:  { icon: CheckCircle,  color: 'text-blue-600',   bg: 'bg-blue-50',    label: 'Confirmed' },
  processing: { icon: Package,      color: 'text-purple-600', bg: 'bg-purple-50',  label: 'Processing' },
  shipped:    { icon: Truck,        color: 'text-orange-600', bg: 'bg-orange-50',  label: 'Shipped' },
  delivered:  { icon: CheckCircle,  color: 'text-green-600',  bg: 'bg-green-50',   label: 'Delivered' },
  cancelled:  { icon: XCircle,      color: 'text-red-600',    bg: 'bg-red-50',     label: 'Cancelled' },
};

export default function OrdersPage() {
  const { user } = useRequireAuth();

  const { data: orders, isLoading } = useQuery({
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
      <div className='max-w-3xl mx-auto px-4 py-8'>
        <div className='flex items-center gap-3 mb-8'>
          <Link href='/account' className='text-gray-400 hover:text-brand-500 transition-colors'>
            Account
          </Link>
          <ChevronRight size={16} className='text-gray-300' />
          <h1 className='text-2xl font-bold text-gray-900'>My Orders</h1>
        </div>

        {isLoading ? (
          <div className='space-y-4'>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className='bg-white border border-gray-100 rounded-2xl p-6 animate-pulse'>
                <div className='h-4 bg-gray-200 rounded w-1/4 mb-3' />
                <div className='h-4 bg-gray-200 rounded w-1/2' />
              </div>
            ))}
          </div>
        ) : !orders || orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className='text-center py-20'
          >
            <ShoppingBag size={80} className='mx-auto text-gray-200 mb-6' />
            <h2 className='text-xl font-bold text-gray-900 mb-2'>No orders yet</h2>
            <p className='text-gray-500 mb-8'>Your order history will appear here</p>
            <Link href='/products'
              className='inline-flex items-center gap-2 bg-brand-500 text-white font-bold px-8 py-4 rounded-2xl hover:bg-brand-600 transition-colors'>
              Start Shopping
            </Link>
          </motion.div>
        ) : (
          <div className='space-y-4'>
            {orders.map((order: any, i: number) => {
              const status = statusConfig[order.status] || statusConfig.pending;
              const StatusIcon = status.icon;
              return (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link href={`/account/orders/${order._id}`}
                    className='block bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow group'
                  >
                    <div className='flex items-start justify-between mb-4'>
                      <div>
                        <p className='text-xs text-gray-400 mb-1'>Order ID</p>
                        <p className='font-mono text-sm font-medium text-gray-900'>#{order._id.slice(-8).toUpperCase()}</p>
                      </div>
                      <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${status.bg} ${status.color}`}>
                        <StatusIcon size={12} />
                        {status.label}
                      </span>
                    </div>

                    <div className='flex items-center gap-3 mb-4'>
                      <div className='flex -space-x-2'>
                        {order.items?.slice(0, 3).map((item: any, j: number) => (
                          <div key={j} className='w-10 h-10 bg-gray-100 rounded-lg border-2 border-white flex items-center justify-center text-lg'>
                            📦
                          </div>
                        ))}
                        {order.items?.length > 3 && (
                          <div className='w-10 h-10 bg-gray-100 rounded-lg border-2 border-white flex items-center justify-center text-xs font-bold text-gray-500'>
                            +{order.items.length - 3}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className='text-sm font-medium text-gray-900'>
                          {order.items?.length} {order.items?.length === 1 ? 'item' : 'items'}
                        </p>
                        <p className='text-xs text-gray-400'>{formatDate(order.createdAt)}</p>
                      </div>
                    </div>

                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='text-xs text-gray-400'>Total</p>
                        <p className='font-bold text-gray-900'>{formatPrice(order.total)}</p>
                      </div>
                      <ChevronRight size={20} className='text-gray-400 group-hover:text-brand-500 transition-colors' />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
