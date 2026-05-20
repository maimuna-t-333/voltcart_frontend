'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, Eye, Users } from 'lucide-react';
import Link from 'next/link';
import PageTransition from '@/components/layout/PageTransition';
import { useRequireAdmin } from '@/hooks/useAuth';
import api from '@/lib/axios';

export default function AdminCustomersPage() {
  const { user } = useRequireAdmin();
  const [search, setSearch] = useState('');
  const [page, setPage]     = useState(1);
  const [q, setQ]           = useState('');   // committed search term

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
      <div className='max-w-7xl mx-auto px-4 py-8'>

        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-2xl font-bold text-gray-900'>Customers</h1>
          <p className='text-gray-500 mt-1'>{data?.total ?? 0} registered customers</p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className='relative mb-6'>
          <Search size={18} className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400' />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder='Search by name or email...'
            className='w-full pl-11 pr-32 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm'
          />
          <button type='submit'
            className='absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 transition-colors'>
            Search
          </button>
        </form>

        {/* Table */}
        <div className='bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden'>
          <div className='grid grid-cols-12 gap-4 p-4 bg-gray-50 text-xs font-semibold text-gray-500 border-b border-gray-100 uppercase tracking-wide'>
            <div className='col-span-4'>Customer</div>
            <div className='col-span-3'>Email</div>
            <div className='col-span-2'>Joined</div>
            <div className='col-span-2'>Verified</div>
            <div className='col-span-1'></div>
          </div>

          {isLoading ? (
            <div className='p-12 text-center text-gray-400'>Loading customers...</div>
          ) : customers.length === 0 ? (
            <div className='p-12 text-center'>
              <Users size={36} className='text-gray-200 mx-auto mb-3' />
              <p className='text-gray-400'>No customers found</p>
            </div>
          ) : (
            <div className='divide-y divide-gray-50'>
              {customers.map((customer: any, i: number) => (
                <motion.div key={customer._id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className='grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50 transition-colors'>
                  <div className='col-span-4 flex items-center gap-3'>
                    <div className='w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-sm shrink-0'>
                      {customer.name?.charAt(0).toUpperCase()}
                    </div>
                    <p className='font-medium text-gray-900 truncate'>{customer.name}</p>
                  </div>
                  <div className='col-span-3 text-sm text-gray-500 truncate'>{customer.email}</div>
                  <div className='col-span-2 text-sm text-gray-500'>
                    {new Date(customer.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                  </div>
                  <div className='col-span-2'>
                    {customer.isVerified
                      ? <span className='text-xs px-2 py-1 rounded-full bg-green-100 text-green-600 font-medium'>Verified</span>
                      : <span className='text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-400 font-medium'>Unverified</span>}
                  </div>
                  <div className='col-span-1 flex justify-end'>
                    <Link href={`/admin/customers/${customer._id}`} className='text-brand-500 hover:text-brand-600'>
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