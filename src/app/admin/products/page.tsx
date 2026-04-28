'use client';
import { useEffect, useState } from 'react';
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

export default function AdminProductsPage() {
  const router = useRouter();
  const user = useAuthStore(s => s.user);
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user) router.push('/auth/login');
    else if (user.role !== 'admin') router.push('/');
  }, [user]);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'products', search],
    queryFn: async () => {
      const params = search ? `?search=${search}` : '';
      const { data } = await api.get(`/products${params}&limit=50`);
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

  if (!user || user.role !== 'admin') return null;

  return (
    <PageTransition>
      <div className='max-w-7xl mx-auto px-4 py-8'>
        <div className='flex items-center justify-between mb-8'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>Products</h1>
            <p className='text-gray-500 mt-1'>{data?.total || 0} total products</p>
          </div>
          <Link href='/admin/products/new'
            className='flex items-center gap-2 bg-brand-500 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-600 transition-colors'>
            <Plus size={18} />
            Add Product
          </Link>
        </div>

        {/* Search */}
        <div className='relative mb-6'>
          <Search size={18} className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400' />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder='Search products...'
            className='w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500'
          />
        </div>

        {/* Products table */}
        <div className='bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden'>
          <div className='grid grid-cols-12 gap-4 p-4 bg-gray-50 text-sm font-semibold text-gray-500 border-b border-gray-100'>
            <div className='col-span-5'>Product</div>
            <div className='col-span-2'>Category</div>
            <div className='col-span-2'>Price</div>
            <div className='col-span-1'>Stock</div>
            <div className='col-span-1'>Status</div>
            <div className='col-span-1'>Actions</div>
          </div>

          {isLoading ? (
            <div className='p-8 text-center text-gray-400'>Loading...</div>
          ) : (
            <div className='divide-y divide-gray-50'>
              {data?.products?.map((product: any, i: number) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className='grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50 transition-colors'
                >
                  <div className='col-span-5 flex items-center gap-3'>
                    <div className='w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-lg flex-shrink-0'>📦</div>
                    <div className='min-w-0'>
                      <p className='font-medium text-gray-900 truncate'>{product.name}</p>
                      <p className='text-gray-400 text-xs'>{product.brand}</p>
                    </div>
                  </div>
                  <div className='col-span-2 text-sm text-gray-600'>{product.category}</div>
                  <div className='col-span-2 font-medium'>{formatPrice(product.basePrice)}</div>
                  <div className='col-span-1 text-sm'>
                    {product.variants.reduce((s: number, v: any) => s + v.stock, 0)}
                  </div>
                  <div className='col-span-1'>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${product.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                      {product.status}
                    </span>
                  </div>
                  <div className='col-span-1 flex items-center gap-2'>
                    <Link href={`/admin/products/${product._id}/edit`}
                      className='text-brand-500 hover:text-brand-600'>
                      <Edit size={16} />
                    </Link>
                    <button onClick={() => handleDelete(product._id, product.name)}
                      className='text-red-400 hover:text-red-500'>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
