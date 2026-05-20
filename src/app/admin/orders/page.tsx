'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Eye } from 'lucide-react';
import Link from 'next/link';
import PageTransition from '@/components/layout/PageTransition';
import { useRequireAdmin } from '@/hooks/useAuth';
import api from '@/lib/axios';
import { formatPrice } from '@/lib/utils';

const STATUSES = ['all','pending','confirmed','processing','shipped','out_for_delivery','delivered','cancelled','refunded'];

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

export default function AdminOrdersPage() {
  const { user } = useRequireAdmin();
  const [status, setStatus]   = useState('all');
  const [page, setPage]       = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'orders', status, page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: '15' });
      if (status !== 'all') params.set('status', status);
      const { data } = await api.get(`/orders?${params}`);
      return data.data;
    },
    enabled: !!user,
  });

  if (!user || user.role !== 'admin') return null;

  return (
    <PageTransition>
      <div className='max-w-7xl mx-auto px-4 py-8'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-2xl font-bold text-gray-900'>Orders</h1>
          <p className='text-gray-500 mt-1'>{data?.total ?? 0} total orders</p>
        </div>

        {/* Status filter tabs */}
        <div className='flex gap-2 flex-wrap mb-6'>
          {STATUSES.map(s => (
            <button key={s} onClick={() => { setStatus(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                status === s
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}>
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className='bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden'>
          <div className='grid grid-cols-12 gap-4 p-4 bg-gray-50 text-xs font-semibold text-gray-500 border-b border-gray-100 uppercase tracking-wide'>
            <div className='col-span-3'>Order</div>
            <div className='col-span-3'>Customer</div>
            <div className='col-span-2'>Date</div>
            <div className='col-span-1'>Items</div>
            <div className='col-span-1'>Total</div>
            <div className='col-span-1'>Status</div>
            <div className='col-span-1'></div>
          </div>

          {isLoading ? (
            <div className='p-12 text-center text-gray-400'>Loading orders...</div>
          ) : data?.orders?.length === 0 ? (
            <div className='p-12 text-center text-gray-400'>No orders found</div>
          ) : (
            <div className='divide-y divide-gray-50'>
              {data?.orders?.map((order: any, i: number) => (
                <motion.div key={order._id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className='grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50 transition-colors'>
                  <div className='col-span-3'>
                    <p className='font-mono text-xs text-gray-900 font-medium'>#{order._id.slice(-8).toUpperCase()}</p>
                    {order.trackingNumber && (
                      <p className='text-xs text-gray-400 mt-0.5'>Track: {order.trackingNumber}</p>
                    )}
                  </div>
                  <div className='col-span-3'>
                    <p className='text-sm font-medium text-gray-900'>{order.user?.name ?? 'Guest'}</p>
                    <p className='text-xs text-gray-400 truncate'>{order.user?.email ?? order.guestEmail}</p>
                  </div>
                  <div className='col-span-2 text-sm text-gray-500'>
                    {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                  </div>
                  <div className='col-span-1 text-sm text-gray-600'>{order.items?.length}</div>
                  <div className='col-span-1 font-semibold text-gray-900 text-sm'>{formatPrice(order.total)}</div>
                  <div className='col-span-1'>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-500'}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className='col-span-1 flex justify-end'>
                    <Link href={`/admin/orders/${order._id}`} className='text-brand-500 hover:text-brand-600'>
                      <Eye size={16} />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {data?.pages > 1 && (
          <div className='flex items-center justify-center gap-2 mt-6'>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className='px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40'>
              Previous
            </button>
            <span className='text-sm text-gray-500'>Page {page} of {data.pages}</span>
            <button onClick={() => setPage(p => Math.min(data.pages, p + 1))} disabled={page === data.pages}
              className='px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40'>
              Next
            </button>
          </div>
        )}
      </div>
    </PageTransition>
  );
}