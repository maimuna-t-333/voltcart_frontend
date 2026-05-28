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
  pending:          '#f59e0b',
  confirmed:        '#3b82f6',
  processing:       '#8b5cf6',
  shipped:          '#f97316',
  out_for_delivery: '#06b6d4',
  delivered:        '#22c55e',
  cancelled:        '#ef4444',
  refunded:         '#6b7280',
};

export default function AdminOrdersPage() {
  const { user } = useRequireAdmin();
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);

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
      <div className='p-6 lg:p-8 max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-6'>
          <h1 className='text-xl font-bold' style={{ color: 'var(--tx)' }}>Orders</h1>
          <p className='text-sm mt-0.5' style={{ color: 'var(--tx3)' }}>{data?.total ?? 0} total orders</p>
        </div>

        {/* Status filter pills */}
        <div className='flex gap-1.5 flex-wrap mb-5'>
          {STATUSES.map(s => (
            <button key={s} onClick={() => { setStatus(s); setPage(1); }}
              className='px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all'
              style={{
                background: status === s ? '#6366f1' : 'var(--surface)',
                color: status === s ? '#fff' : 'var(--tx2)',
                border: status === s ? 'none' : '1px solid var(--card-bdr)',
              }}>
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className='rounded-xl overflow-x-auto' style={{ background: 'var(--card)', border: '1px solid var(--card-bdr)' }}>
          <div className='grid grid-cols-12 gap-3 px-5 py-3 text-xs font-semibold uppercase tracking-wider min-w-[640px]'
            style={{ color: 'var(--tx3)', borderBottom: '1px solid var(--card-bdr)', background: 'var(--surface)' }}>
            <div className='col-span-3'>Order</div>
            <div className='col-span-3'>Customer</div>
            <div className='col-span-2'>Date</div>
            <div className='col-span-1'>Items</div>
            <div className='col-span-1'>Total</div>
            <div className='col-span-1'>Status</div>
            <div className='col-span-1'></div>
          </div>

          {isLoading ? (
            <div className='p-12 text-center text-sm' style={{ color: 'var(--tx3)' }}>Loading orders...</div>
          ) : data?.orders?.length === 0 ? (
            <div className='p-12 text-center text-sm' style={{ color: 'var(--tx3)' }}>No orders found</div>
          ) : (
            <div className='divide-y' style={{ borderColor: 'var(--card-bdr)' }}>
              {data?.orders?.map((order: any, i: number) => {
                const color = STATUS_COLORS[order.status] || '#6b7280';
                return (
                  <motion.div key={order._id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.015 }}
                    className='grid grid-cols-12 gap-3 px-5 py-3.5 items-center transition-colors'
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                    <div className='col-span-3'>
                      <p className='font-mono text-xs font-semibold' style={{ color: 'var(--tx)' }}>
                        #{order._id.slice(-8).toUpperCase()}
                      </p>
                      {order.trackingNumber && (
                        <p className='text-[10px] mt-0.5' style={{ color: 'var(--tx3)' }}>Track: {order.trackingNumber}</p>
                      )}
                    </div>
                    <div className='col-span-3'>
                      <p className='text-sm font-medium' style={{ color: 'var(--tx)' }}>{order.user?.name ?? 'Guest'}</p>
                      <p className='text-xs truncate' style={{ color: 'var(--tx3)' }}>{order.user?.email ?? order.guestEmail}</p>
                    </div>
                    <div className='col-span-2 text-sm' style={{ color: 'var(--tx2)' }}>
                      {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                    </div>
                    <div className='col-span-1 text-sm' style={{ color: 'var(--tx2)' }}>{order.items?.length}</div>
                    <div className='col-span-1 text-sm font-semibold' style={{ color: 'var(--tx)' }}>{formatPrice(order.total)}</div>
                    <div className='col-span-1'>
                      <span className='text-[10px] font-semibold px-2 py-0.5 rounded capitalize'
                        style={{ background: `${color}12`, color }}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className='col-span-1 flex justify-end'>
                      <Link href={`/admin/orders/${order._id}`} style={{ color: '#6366f1' }}>
                        <Eye size={15} strokeWidth={1.5} />
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {data?.pages > 1 && (
          <div className='flex items-center justify-center gap-3 mt-5'>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className='px-4 py-2 rounded-lg text-xs font-medium transition-all disabled:opacity-30'
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--card-bdr)',
                color: 'var(--tx2)',
              }}>
              Previous
            </button>
            <span className='text-xs' style={{ color: 'var(--tx3)' }}>Page {page} of {data.pages}</span>
            <button onClick={() => setPage(p => Math.min(data.pages, p + 1))} disabled={page === data.pages}
              className='px-4 py-2 rounded-lg text-xs font-medium transition-all disabled:opacity-30'
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--card-bdr)',
                color: 'var(--tx2)',
              }}>
              Next
            </button>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
