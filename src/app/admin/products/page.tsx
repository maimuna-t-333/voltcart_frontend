'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import PageTransition from '@/components/layout/PageTransition';
import api from '@/lib/axios';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import toast from 'react-hot-toast';

const productColors = ['#6366f1','#8b5cf6','#ec4899','#f43f5e','#f97316','#22c55e','#14b8a6','#3b82f6'];

function ProductThumb({ name }: { name: string }) {
  const initial = name[0].toUpperCase();
  const hash = name.split('').reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0);
  const color = productColors[Math.abs(hash) % productColors.length];
  return (
    <div className='w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shrink-0'
      style={{ background: `${color}12`, color }}>
      {initial}
    </div>
  );
}

export default function AdminProductsPage() {
  const router = useRouter();
  const user = useAuthStore(s => s.user);
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  if (!user || user.role !== 'admin') { router.push('/auth/login'); return null; }

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'products', search],
    queryFn: async () => {
      const { data } = await api.get(`/products?limit=50${search ? `&search=${search}` : ''}`);
      return data.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      toast.success('Product deleted');
    },
    onError: () => toast.error('Failed to delete product'),
  });

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete "${name}"?`)) deleteMutation.mutate(id);
  };

  return (
    <PageTransition>
      <div className='p-6 lg:p-8 max-w-7xl mx-auto'>
        {/* Header */}
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h1 className='text-xl font-bold' style={{ color: 'var(--tx)' }}>Products</h1>
            <p className='text-sm mt-0.5' style={{ color: 'var(--tx3)' }}>{data?.total || 0} total products</p>
          </div>
          <Link href='/admin/products/new'
            className='flex items-center gap-2 font-semibold px-4 py-2 rounded-xl text-white transition-all text-sm'
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <Plus size={15} strokeWidth={1.5} />
            Add Product
          </Link>
        </div>

        {/* Search */}
        <div className='relative mb-5'>
          <Search size={15} className='absolute left-3.5 top-1/2 -translate-y-1/2' style={{ color: 'var(--tx3)' }} strokeWidth={1.5} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder='Search products...'
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
          {/* Header row */}
          <div className='grid grid-cols-12 gap-3 px-5 py-3 text-xs font-semibold uppercase tracking-wider min-w-[640px]' style={{ color: 'var(--tx3)', borderBottom: '1px solid var(--card-bdr)', background: 'var(--surface)' }}>
            <div className='col-span-5'>Product</div>
            <div className='col-span-2'>Category</div>
            <div className='col-span-2'>Price</div>
            <div className='col-span-1'>Stock</div>
            <div className='col-span-1'>Status</div>
            <div className='col-span-1'>Actions</div>
          </div>

          {isLoading ? (
            <div className='p-10 text-center text-sm' style={{ color: 'var(--tx3)' }}>Loading...</div>
          ) : (
            <div className='divide-y' style={{ borderColor: 'var(--card-bdr)' }}>
              {data?.products?.map((product: any, i: number) => {
                const totalStock = product.variants?.reduce((s: number, v: any) => s + v.stock, 0) || 0;
                return (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.025 }}
                    className='grid grid-cols-12 gap-3 px-5 py-3.5 items-center transition-colors'
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div className='col-span-5 flex items-center gap-3 min-w-0'>
                      <ProductThumb name={product.name} />
                      <div className='min-w-0'>
                        <p className='font-medium text-sm truncate' style={{ color: 'var(--tx)' }}>{product.name}</p>
                        <p className='text-xs' style={{ color: 'var(--tx3)' }}>{product.brand}</p>
                      </div>
                    </div>
                    <div className='col-span-2 text-sm' style={{ color: 'var(--tx2)' }}>{product.category}</div>
                    <div className='col-span-2 text-sm font-medium' style={{ color: 'var(--tx)' }}>{formatPrice(product.basePrice)}</div>
                    <div className='col-span-1 text-sm' style={{ color: 'var(--tx2)' }}>{totalStock}</div>
                    <div className='col-span-1'>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${product.status === 'active' ? 'text-green-500' : ''}`}
                        style={{ background: product.status === 'active' ? 'rgba(34,197,94,0.1)' : 'var(--surface)', color: product.status === 'active' ? '#22c55e' : 'var(--tx3)' }}>
                        {product.status}
                      </span>
                    </div>
                    <div className='col-span-1 flex items-center gap-2'>
                      <Link href={`/admin/products/${product._id}/edit`} style={{ color: '#6366f1' }}>
                        <Edit size={14} strokeWidth={1.5} />
                      </Link>
                      <button onClick={() => handleDelete(product._id, product.name)} style={{ color: '#f87171' }}>
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
