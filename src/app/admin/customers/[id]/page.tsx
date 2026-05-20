'use client';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, MapPin, ShoppingBag, Calendar, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import PageTransition from '@/components/layout/PageTransition';
import { useRequireAdmin } from '@/hooks/useAuth';
import api from '@/lib/axios';
import { formatPrice } from '@/lib/utils';

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

export default function AdminCustomerDetailPage() {
  const { user } = useRequireAdmin();
  const { id }   = useParams<{ id: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'customer', id],
    queryFn: async () => {
      const { data } = await api.get(`/users/${id}`);
      return data.data;
    },
    enabled: !!id && !!user,
  });

  if (!user || user.role !== 'admin') return null;

  if (isLoading) return (
    <div className='min-h-screen flex items-center justify-center'>
      <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500' />
    </div>
  );

  if (!data) return <div className='p-8 text-center text-gray-400'>Customer not found</div>;

  const { user: customer, orders, totalSpent } = data;

  return (
    <PageTransition>
      <div className='max-w-5xl mx-auto px-4 py-8'>

        {/* Header */}
        <div className='flex items-center gap-4 mb-8'>
          <Link href='/admin/customers' className='text-gray-400 hover:text-gray-600'>
            <ArrowLeft size={20} />
          </Link>
          <div className='flex items-center gap-4'>
            <div className='w-14 h-14 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-xl'>
              {customer.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className='flex items-center gap-2'>
                <h1 className='text-2xl font-bold text-gray-900'>{customer.name}</h1>
                {customer.isVerified
                  ? <CheckCircle size={18} className='text-green-500' />
                  : <XCircle size={18} className='text-gray-300' />}
              </div>
              <p className='text-gray-500 text-sm'>{customer.email}</p>
            </div>
          </div>
        </div>

        <div className='grid lg:grid-cols-3 gap-6'>

          {/* Left — orders */}
          <div className='lg:col-span-2 space-y-6'>

            {/* Stats bar */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className='grid grid-cols-3 gap-4'>
              {[
                { label: 'Total Orders', value: orders.length, icon: ShoppingBag, color: 'text-purple-500 bg-purple-50' },
                { label: 'Total Spent',  value: formatPrice(totalSpent), icon: null, color: 'text-green-500 bg-green-50' },
                { label: 'Member Since', value: new Date(customer.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }), icon: Calendar, color: 'text-blue-500 bg-blue-50' },
              ].map(stat => (
                <div key={stat.label} className='bg-white border border-gray-100 rounded-2xl shadow-sm p-4 text-center'>
                  <p className='text-xl font-bold text-gray-900'>{stat.value}</p>
                  <p className='text-xs text-gray-400 mt-1'>{stat.label}</p>
                </div>
              ))}
            </motion.div>

            {/* Orders */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className='bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden'>
              <div className='flex items-center gap-3 p-5 border-b border-gray-100'>
                <ShoppingBag size={18} className='text-gray-400' />
                <h2 className='font-semibold text-gray-900'>Order History</h2>
              </div>
              {orders.length === 0 ? (
                <div className='p-8 text-center text-gray-400 text-sm'>No orders yet</div>
              ) : (
                <div className='divide-y divide-gray-50'>
                  {orders.map((order: any) => (
                    <div key={order._id} className='flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors'>
                      <div className='flex-1'>
                        <div className='flex items-center gap-2'>
                          <p className='font-mono text-xs font-medium text-gray-900'>
                            #{order._id.slice(-8).toUpperCase()}
                          </p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-500'}`}>
                            {order.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className='text-xs text-gray-400 mt-0.5'>
                          {new Date(order.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' })} · {order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <p className='font-semibold text-gray-900 text-sm'>{formatPrice(order.total)}</p>
                      <Link href={`/admin/orders/${order._id}`}
                        className='text-xs text-brand-500 hover:underline font-medium'>
                        View
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Right — profile info */}
          <div className='space-y-6'>

            {/* Contact */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className='bg-white border border-gray-100 rounded-2xl shadow-sm p-5'>
              <h2 className='font-semibold text-gray-900 mb-4'>Contact</h2>
              <div className='space-y-3'>
                <div className='flex items-center gap-3 text-sm text-gray-600'>
                  <Mail size={15} className='text-gray-400 shrink-0' />
                  <span className='truncate'>{customer.email}</span>
                </div>
                <div className='flex items-center gap-3 text-sm text-gray-600'>
                  <Calendar size={15} className='text-gray-400 shrink-0' />
                  <span>Joined {new Date(customer.createdAt).toLocaleDateString('en-US', { dateStyle: 'long' })}</span>
                </div>
              </div>
            </motion.div>

            {/* Addresses */}
            {customer.addresses?.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className='bg-white border border-gray-100 rounded-2xl shadow-sm p-5'>
                <div className='flex items-center gap-3 mb-4'>
                  <MapPin size={18} className='text-gray-400' />
                  <h2 className='font-semibold text-gray-900'>Addresses</h2>
                </div>
                <div className='space-y-3'>
                  {customer.addresses.map((addr: any, i: number) => (
                    <div key={i} className='text-sm text-gray-600 border border-gray-100 rounded-xl p-3'>
                      {addr.label && <p className='font-medium text-gray-900 mb-1'>{addr.label}</p>}
                      <p>{addr.line1}</p>
                      <p>{addr.city}, {addr.state} {addr.zip}</p>
                      <p>{addr.country}</p>
                      {addr.isDefault && <span className='text-xs text-brand-500 font-medium mt-1 inline-block'>Default</span>}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}