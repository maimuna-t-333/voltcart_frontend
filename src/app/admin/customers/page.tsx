'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, Eye, Users } from 'lucide-react';
import Link from 'next/link';
import PageTransition from '@/components/layout/PageTransition';
import { useRequireAdmin } from '@/hooks/useAuth';
import api from '@/lib/axios';

const avatarColors = ['#6366f1','#8b5cf6','#ec4899','#f43f5e','#f97316','#22c55e','#14b8a6','#3b82f6'];

export default function AdminCustomersPage() {
  const { user } = useRequireAdmin();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'customers', q, page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (q) params.set('search', q);
      const { data } = await api.get(`/users?${params}`);
      return data.data;
    },
    enabled: !!user,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQ(search);
    setPage(1);
  };

  if (!user || user.role !== 'admin') return null;

  const customers = data?.users ?? [];

  return (
    <PageTransition>
      <div className='p-6 lg:p-8 max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-6'>
          <h1 className='text-xl font-bold' style={{ color: 'var(--tx)' }}>Customers</h1>
          <p className='text-sm mt-0.5' style={{ color: 'var(--tx3)' }}>{data?.total ?? 0} registered customers</p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className='relative mb-5'>
          <Search size={15} className='absolute left-3.5 top-1/2 -translate-y-1/2' style={{ color: 'var(--tx3)' }} strokeWidth={1.5} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder='Search by name or email...'
            className='w-full pl-10 pr-24 py-2.5 rounded-xl text-sm outline-none transition-all'
            style={{
              background: 'var(--card)',
              border: '1px solid var(--card-bdr)',
              color: 'var(--tx)',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
            onBlur={e => { e.currentTarget.style.borderColor = 'var(--card-bdr)'; e.currentTarget.style.boxShadow = 'none'; }}
          />
          <button type='submit'
            className='absolute right-1.5 top-1/2 -translate-y-1/2 px-3.5 py-1.5 rounded-lg text-xs font-medium text-white transition-all'
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            Search
          </button>
        </form>

        {/* Table */}
        <div className='rounded-xl overflow-x-auto' style={{ background: 'var(--card)', border: '1px solid var(--card-bdr)' }}>
          <div className='grid grid-cols-12 gap-3 px-5 py-3 text-xs font-semibold uppercase tracking-wider min-w-[640px]'
            style={{ color: 'var(--tx3)', borderBottom: '1px solid var(--card-bdr)', background: 'var(--surface)' }}>
            <div className='col-span-4'>Customer</div>
            <div className='col-span-3'>Email</div>
            <div className='col-span-2'>Joined</div>
            <div className='col-span-2'>Verified</div>
            <div className='col-span-1'></div>
          </div>

          {isLoading ? (
            <div className='p-12 text-center text-sm' style={{ color: 'var(--tx3)' }}>Loading customers...</div>
          ) : customers.length === 0 ? (
            <div className='p-12 text-center'>
              <Users size={32} className='mx-auto mb-3' style={{ color: 'var(--tx3)' }} strokeWidth={1.5} />
              <p className='text-sm' style={{ color: 'var(--tx3)' }}>No customers found</p>
            </div>
          ) : (
            <div className='divide-y' style={{ borderColor: 'var(--card-bdr)' }}>
              {customers.map((customer: any, i: number) => {
                const hash = customer.name ? customer.name.split('').reduce((h: number, c: string) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0) : 0;
                const avatarColor = avatarColors[Math.abs(hash) % avatarColors.length];
                return (
                  <motion.div key={customer._id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.015 }}
                    className='grid grid-cols-12 gap-3 px-5 py-3.5 items-center transition-colors'
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                    <div className='col-span-4 flex items-center gap-3'>
                      <div className='w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0'
                        style={{ background: avatarColor }}>
                        {customer.name?.charAt(0).toUpperCase()}
                      </div>
                      <p className='font-medium text-sm truncate' style={{ color: 'var(--tx)' }}>{customer.name}</p>
                    </div>
                    <div className='col-span-3 text-sm truncate' style={{ color: 'var(--tx2)' }}>{customer.email}</div>
                    <div className='col-span-2 text-sm' style={{ color: 'var(--tx2)' }}>
                      {new Date(customer.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                    </div>
                    <div className='col-span-2'>
                      {customer.isVerified
                        ? <span className='text-[10px] font-semibold px-2 py-0.5 rounded' style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>Verified</span>
                        : <span className='text-[10px] font-semibold px-2 py-0.5 rounded' style={{ background: 'var(--surface)', color: 'var(--tx3)' }}>Unverified</span>}
                    </div>
                    <div className='col-span-1 flex justify-end'>
                      <Link href={`/admin/customers/${customer._id}`} style={{ color: '#6366f1' }}>
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
              style={{ background: 'var(--surface)', border: '1px solid var(--card-bdr)', color: 'var(--tx2)' }}>
              Previous
            </button>
            <span className='text-xs' style={{ color: 'var(--tx3)' }}>Page {page} of {data.pages}</span>
            <button onClick={() => setPage(p => Math.min(data.pages, p + 1))} disabled={page === data.pages}
              className='px-4 py-2 rounded-lg text-xs font-medium transition-all disabled:opacity-30'
              style={{ background: 'var(--surface)', border: '1px solid var(--card-bdr)', color: 'var(--tx2)' }}>
              Next
            </button>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
