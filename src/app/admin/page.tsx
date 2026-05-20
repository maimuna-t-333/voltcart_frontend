'use client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ShoppingBag, Users, DollarSign, Package, ArrowRight } from 'lucide-react';
import PageTransition from '@/components/layout/PageTransition';
import KpiCard from '@/components/admin/KpiCard';
import RevenueChart from '@/components/admin/RevenueChart';
import api from '@/lib/axios';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import { useRequireAdmin } from '@/hooks/useAuth';

export default function AdminDashboard() {
  const { user } = useRequireAdmin();

  const { data: kpi, isLoading: loadingKpi } = useQuery({
    queryKey: ['admin', 'kpi'],
    queryFn: async () => {
      const { data } = await api.get('/admin/dashboard/kpi');
      return data.data;
    },
    enabled: !!user,
  });

  const { data: recentProducts, isLoading: loadingProducts } = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: async () => {
      const { data } = await api.get('/products?limit=5&sort=newest');
      return data.data;
    },
    enabled: !!user,
  });

  if (!user || user.role !== 'admin') return null;

  const stats = [
    { label: 'Total Products',  value: kpi?.totalProducts ?? 0,                              icon: Package,     color: 'from-blue-500 to-blue-600',   change: null,   loading: loadingKpi },
    { label: 'Total Orders',    value: kpi?.totalOrders ?? 0,                                icon: ShoppingBag, color: 'from-purple-500 to-purple-600', change: null,  loading: loadingKpi },
    { label: 'Revenue',         value: kpi ? formatPrice(kpi.totalRevenue) : '$0',           icon: DollarSign,  color: 'from-green-500 to-green-600',  change: null,   loading: loadingKpi },
    { label: 'Customers',       value: kpi?.totalUsers ?? 0,                                 icon: Users,       color: 'from-orange-500 to-orange-600', change: null,  loading: loadingKpi },
  ];

  return (
    <PageTransition>
      <div className='max-w-7xl mx-auto px-4 py-8'>
        {/* Header */}
        <div className='flex items-center justify-between mb-8'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>Admin Dashboard</h1>
            <p className='text-gray-500 mt-1'>Welcome back, {user.name}!</p>
          </div>
          <Link href='/admin/products/new'
            className='flex items-center gap-2 bg-brand-500 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-600 transition-colors'>
            + Add Product
          </Link>
        </div>

        {/* Today's snapshot */}
        {kpi && (
          <div className='bg-gradient-to-r from-brand-50 to-green-50 border border-brand-100 rounded-2xl px-6 py-4 mb-6 flex gap-8 flex-wrap'>
            <div>
              <p className='text-xs text-gray-500 uppercase tracking-wide'>Today's Revenue</p>
              <p className='text-xl font-bold text-gray-900'>{formatPrice(kpi.todayRevenue)}</p>
            </div>
            <div>
              <p className='text-xs text-gray-500 uppercase tracking-wide'>Today's Orders</p>
              <p className='text-xl font-bold text-gray-900'>{kpi.todayOrders}</p>
            </div>
            <div>
              <p className='text-xs text-gray-500 uppercase tracking-wide'>Avg Order Value</p>
              <p className='text-xl font-bold text-gray-900'>{formatPrice(kpi.averageOrderValue)}</p>
            </div>
          </div>
        )}

        {/* KPI Cards */}
        <div className='grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8'>
          {stats.map(stat => (
            <KpiCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              isLoading={stat.loading}
            />
          ))}
        </div>

        {/* Quick Links */}
        <div className='grid md:grid-cols-3 gap-5 mb-8'>
          {[
            { label: 'Manage Products', desc: 'Add, edit, delete products',   href: '/admin/products',  icon: Package,     color: 'bg-blue-50 text-blue-600' },
            { label: 'Manage Orders',   desc: 'View and update orders',       href: '/admin/orders',    icon: ShoppingBag, color: 'bg-purple-50 text-purple-600' },
            { label: 'View Customers',  desc: 'Browse customer accounts',     href: '/admin/customers', icon: Users,       color: 'bg-green-50 text-green-600' },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
            >
              <Link href={item.href}
                className='flex items-center gap-4 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow group'
              >
                <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center`}>
                  <item.icon size={22} />
                </div>
                <div className='flex-1'>
                  <p className='font-semibold text-gray-900'>{item.label}</p>
                  <p className='text-gray-500 text-sm'>{item.desc}</p>
                </div>
                <ArrowRight size={18} className='text-gray-400 group-hover:text-brand-500 transition-colors' />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Revenue Chart */}
        <RevenueChart />

        {/* Recent Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className='mt-8 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden'
        >
          <div className='flex items-center justify-between p-6 border-b border-gray-100'>
            <h2 className='font-bold text-gray-900'>Recent Products</h2>
            <Link href='/admin/products' className='text-brand-500 text-sm font-medium hover:underline'>
              View All
            </Link>
          </div>
          <div className='divide-y divide-gray-50'>
            {loadingProducts ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className='flex items-center gap-4 p-4'>
                  <div className='w-12 h-12 bg-gray-100 rounded-xl animate-pulse' />
                  <div className='flex-1 space-y-2'>
                    <div className='h-4 w-40 bg-gray-100 rounded animate-pulse' />
                    <div className='h-3 w-24 bg-gray-100 rounded animate-pulse' />
                  </div>
                </div>
              ))
            ) : recentProducts?.products?.map((product: any) => (
              <div key={product._id} className='flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors'>
                <div className='w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-xl shrink-0'>📦</div>
                <div className='flex-1 min-w-0'>
                  <p className='font-medium text-gray-900 truncate'>{product.name}</p>
                  <p className='text-gray-500 text-sm'>{product.category} • {product.brand}</p>
                </div>
                <div className='text-right'>
                  <p className='font-bold text-gray-900'>{formatPrice(product.basePrice)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${product.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                    {product.status}
                  </span>
                </div>
                <Link href={`/admin/products/${product._id}/edit`} className='text-brand-500 text-sm font-medium hover:underline ml-2'>
                  Edit
                </Link>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}