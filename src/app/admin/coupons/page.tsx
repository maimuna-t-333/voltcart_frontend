'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Search, Tag } from 'lucide-react';
import Link from 'next/link';
import PageTransition from '@/components/layout/PageTransition';
import { useRequireAdmin } from '@/hooks/useAuth';
import api from '@/lib/axios';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AdminCouponsPage() {
  const { user } = useRequireAdmin();
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'coupons', search],
    queryFn: async () => {
      const { data } = await api.get(`/coupons?limit=50${search ? `&search=${search}` : ''}`);
      return data.data;
    },
    enabled: !!user,
  });

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Delete coupon "${code}"?`)) return;
    try {
      await api.delete(`/coupons/${id}`);
      toast.success('Coupon deleted');
    } catch {
      toast.error('Failed to delete coupon');
    }
  };

  if (!user || user.role !== 'admin') return null;

  const coupons = data?.coupons ?? [];

  return (
    <PageTransition>
      <div className='p-6 lg:p-8 max-w-7xl mx-auto'>
        {/* Header */}
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h1 className='text-xl font-bold' style={{ color: 'var(--tx)' }}>Coupons</h1>
            <p className='text-sm mt-0.5' style={{ color: 'var(--tx3)' }}>{coupons.length} coupons</p>
          </div>
          <Link href='/admin/coupons/new'
            className='flex items-center gap-2 font-semibold px-4 py-2 rounded-xl text-white transition-all text-sm'
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <Plus size={15} strokeWidth={1.5} />
            Add Coupon
          </Link>
        </div>

        {/* Search */}
        <div className='relative mb-5'>
          <Search size={15} className='absolute left-3.5 top-1/2 -translate-y-1/2' style={{ color: 'var(--tx3)' }} strokeWidth={1.5} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder='Search by coupon code...'
            className='w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all'
            style={{
              background: 'var(--card)',
              border: '1px solid var(--card-bdr)',
              color: 'var(--tx)',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
            onBlur={e => { e.currentTarget.style.borderColor = 'var(--card-bdr)'; e.currentTarget.style.boxShadow = 'none'; }}
          />
        </div>

        {/* Table */}
        <div className='rounded-xl overflow-x-auto' style={{ background: 'var(--card)', border: '1px solid var(--card-bdr)' }}>
          <div className='grid grid-cols-12 gap-3 px-5 py-3 text-xs font-semibold uppercase tracking-wider min-w-[640px]'
            style={{ color: 'var(--tx3)', borderBottom: '1px solid var(--card-bdr)', background: 'var(--surface)' }}>
            <div className='col-span-2'>Code</div>
            <div className='col-span-2'>Discount</div>
            <div className='col-span-2'>Min Order</div>
            <div className='col-span-2'>Uses</div>
            <div className='col-span-2'>Expires</div>
            <div className='col-span-1'>Status</div>
            <div className='col-span-1'></div>
          </div>

          {isLoading ? (
            <div className='p-12 text-center text-sm' style={{ color: 'var(--tx3)' }}>Loading coupons...</div>
          ) : coupons.length === 0 && !search ? (
            <div className='p-12 text-center'>
              <Tag size={36} className='mx-auto mb-3' style={{ color: 'var(--tx3)' }} strokeWidth={1.5} />
              <p className='text-sm' style={{ color: 'var(--tx3)' }}>No coupons yet</p>
              <Link href='/admin/coupons/new' className='text-xs mt-1 inline-block' style={{ color: '#6366f1' }}>
                Create your first coupon
              </Link>
            </div>
          ) : (
            <div className='divide-y' style={{ borderColor: 'var(--card-bdr)' }}>
              {coupons.map((coupon: any, i: number) => {
                const expires = new Date(coupon.expiresAt);
                const expired = expires < new Date();
                const active = coupon.isActive && !expired;
                return (
                  <motion.div key={coupon._id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    className='grid grid-cols-12 gap-3 px-5 py-3.5 items-center transition-colors'
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                    <div className='col-span-2'>
                      <span className='font-mono text-xs font-bold px-2 py-0.5 rounded'
                        style={{ background: '#6366f112', color: '#6366f1' }}>
                        {coupon.code}
                      </span>
                    </div>
                    <div className='col-span-2 text-sm font-medium' style={{ color: 'var(--tx)' }}>
                      {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : formatPrice(coupon.discountValue)}
                    </div>
                    <div className='col-span-2 text-sm' style={{ color: 'var(--tx2)' }}>
                      {coupon.minOrderValue ? formatPrice(coupon.minOrderValue) : '—'}
                    </div>
                    <div className='col-span-2 text-sm' style={{ color: 'var(--tx2)' }}>
                      {coupon.usedCount}/{coupon.maxUses ?? '∞'}
                    </div>
                    <div className='col-span-2 text-sm' style={{ color: expired ? '#ef4444' : 'var(--tx2)' }}>
                      {expires.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                    </div>
                    <div className='col-span-1'>
                      <span className='text-[10px] font-semibold px-2 py-0.5 rounded'
                        style={{
                          background: active ? 'rgba(34,197,94,0.1)' : 'var(--surface)',
                          color: active ? '#22c55e' : 'var(--tx3)',
                        }}>
                        {active ? 'Active' : expired ? 'Expired' : 'Inactive'}
                      </span>
                    </div>
                    <div className='col-span-1 flex items-center gap-2'>
                      <Link href={`/admin/coupons/${coupon._id}/edit`} style={{ color: '#6366f1' }}>
                        <Edit size={14} strokeWidth={1.5} />
                      </Link>
                      <button onClick={() => handleDelete(coupon._id, coupon.code)} style={{ color: '#f87171' }}>
                        <Trash2 size={14} strokeWidth={1.5} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
