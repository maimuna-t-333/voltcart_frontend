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
  pending:          '#f59e0b',
  confirmed:        '#3b82f6',
  processing:       '#8b5cf6',
  shipped:          '#f97316',
  out_for_delivery: '#06b6d4',
  delivered:        '#22c55e',
  cancelled:        '#ef4444',
  refunded:         '#6b7280',
};

const avatarColors = ['#6366f1','#8b5cf6','#ec4899','#f43f5e','#f97316','#22c55e','#14b8a6','#3b82f6'];

export default function AdminCustomerDetailPage() {
  const { user } = useRequireAdmin();
  const { id } = useParams<{ id: string }>();

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
      <div className='animate-spin rounded-full h-8 w-8 border-b-2' style={{ borderColor: '#6366f1' }} />
    </div>
  );

  if (!data) return (
    <div className='p-12 text-center text-sm' style={{ color: 'var(--tx3)' }}>Customer not found</div>
  );

  const { user: customer, orders, totalSpent } = data;
  const hash = customer.name ? customer.name.split('').reduce((h: number, c: string) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0) : 0;
  const avatarColor = avatarColors[Math.abs(hash) % avatarColors.length];

  return (
    <PageTransition>
      <div className='max-w-5xl mx-auto p-6 lg:p-8'>
        {/* Header */}
        <div className='flex items-center gap-4 mb-6'>
          <Link href='/admin/customers' className='transition-all' style={{ color: 'var(--tx3)' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#6366f1'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--tx3)'; }}>
            <ArrowLeft size={18} />
          </Link>
          <div className='flex items-center gap-4'>
            <div className='w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white shrink-0'
              style={{ background: avatarColor }}>
              {customer.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className='flex items-center gap-2'>
                <h1 className='text-xl font-bold' style={{ color: 'var(--tx)' }}>{customer.name}</h1>
                {customer.isVerified
                  ? <CheckCircle size={16} style={{ color: '#22c55e' }} strokeWidth={1.5} />
                  : <XCircle size={16} style={{ color: 'var(--tx3)' }} strokeWidth={1.5} />}
              </div>
              <p className='text-sm' style={{ color: 'var(--tx2)' }}>{customer.email}</p>
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
                { label: 'Total Orders', value: orders.length },
                { label: 'Total Spent', value: formatPrice(totalSpent) },
                { label: 'Member Since', value: new Date(customer.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) },
              ].map(stat => (
                <div key={stat.label} className='rounded-xl p-4 text-center'
                  style={{ background: 'var(--card)', border: '1px solid var(--card-bdr)' }}>
                  <p className='text-lg font-bold' style={{ color: 'var(--tx)' }}>{stat.value}</p>
                  <p className='text-xs mt-0.5' style={{ color: 'var(--tx3)' }}>{stat.label}</p>
                </div>
              ))}
            </motion.div>

            {/* Orders */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className='rounded-xl overflow-hidden' style={{ background: 'var(--card)', border: '1px solid var(--card-bdr)' }}>
              <div className='flex items-center gap-3 px-5 py-3.5 text-sm font-semibold'
                style={{ color: 'var(--tx)', borderBottom: '1px solid var(--card-bdr)', background: 'var(--surface)' }}>
                <ShoppingBag size={16} strokeWidth={1.5} style={{ color: 'var(--tx3)' }} />
                Order History
              </div>
              {orders.length === 0 ? (
                <div className='p-8 text-center text-sm' style={{ color: 'var(--tx3)' }}>No orders yet</div>
              ) : (
                <div className='divide-y' style={{ borderColor: 'var(--card-bdr)' }}>
                  {orders.map((order: any) => {
                    const oColor = STATUS_COLORS[order.status] || '#6b7280';
                    return (
                      <div key={order._id} className='flex items-center gap-4 px-5 py-3.5 transition-colors'
                        style={{ background: 'transparent' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                        <div className='flex-1'>
                          <div className='flex items-center gap-2'>
                            <p className='font-mono text-xs font-medium' style={{ color: 'var(--tx)' }}>
                              #{order._id.slice(-8).toUpperCase()}
                            </p>
                            <span className='text-[10px] px-2 py-0.5 rounded font-medium capitalize'
                              style={{ background: `${oColor}12`, color: oColor }}>
                              {order.status.replace('_', ' ')}
                            </span>
                          </div>
                          <p className='text-xs mt-0.5' style={{ color: 'var(--tx3)' }}>
                            {new Date(order.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' })} · {order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <p className='text-sm font-semibold' style={{ color: 'var(--tx)' }}>{formatPrice(order.total)}</p>
                        <Link href={`/admin/orders/${order._id}`}
                          className='text-xs font-medium transition-colors' style={{ color: '#6366f1' }}>
                          View
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </div>

          {/* Right — profile info */}
          <div className='space-y-5'>

            {/* Contact */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className='rounded-xl p-5' style={{ background: 'var(--card)', border: '1px solid var(--card-bdr)' }}>
              <h2 className='text-sm font-semibold mb-4' style={{ color: 'var(--tx)' }}>Contact</h2>
              <div className='space-y-3'>
                <div className='flex items-center gap-3 text-sm' style={{ color: 'var(--tx2)' }}>
                  <Mail size={15} style={{ color: 'var(--tx3)' }} strokeWidth={1.5} />
                  <span className='truncate'>{customer.email}</span>
                </div>
                <div className='flex items-center gap-3 text-sm' style={{ color: 'var(--tx2)' }}>
                  <Calendar size={15} style={{ color: 'var(--tx3)' }} strokeWidth={1.5} />
                  <span>Joined {new Date(customer.createdAt).toLocaleDateString('en-US', { dateStyle: 'long' })}</span>
                </div>
              </div>
            </motion.div>

            {/* Addresses */}
            {customer.addresses?.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className='rounded-xl p-5' style={{ background: 'var(--card)', border: '1px solid var(--card-bdr)' }}>
                <div className='flex items-center gap-3 mb-4'>
                  <MapPin size={16} strokeWidth={1.5} style={{ color: 'var(--tx3)' }} />
                  <h2 className='text-sm font-semibold' style={{ color: 'var(--tx)' }}>Addresses</h2>
                </div>
                <div className='space-y-3'>
                  {customer.addresses.map((addr: any, i: number) => (
                    <div key={i} className='text-sm rounded-xl p-3' style={{ color: 'var(--tx2)', border: '1px solid var(--card-bdr)' }}>
                      {addr.label && <p className='font-medium mb-1' style={{ color: 'var(--tx)' }}>{addr.label}</p>}
                      <p>{addr.line1}</p>
                      <p>{addr.city}, {addr.state} {addr.zip}</p>
                      <p>{addr.country}</p>
                      {addr.isDefault && (
                        <span className='text-[10px] font-medium mt-1 inline-block' style={{ color: '#6366f1' }}>Default</span>
                      )}
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
