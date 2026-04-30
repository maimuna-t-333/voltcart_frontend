'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, ShoppingBag, Heart, LogOut, Settings, ChevronRight } from 'lucide-react';
import PageTransition from '@/components/layout/PageTransition';
import Link from 'next/link';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';

export default function AccountPage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (!user) router.push('/auth/login');
  }, [user]);

 const handleLogout = async () => {
  await logout();
  router.push('/');
};

  if (!user) return null;

  const menuItems = [
    { icon: ShoppingBag, label: 'My Orders', desc: 'Track and manage your orders', href: '/account/orders' },
    { icon: Heart, label: 'Wishlist', desc: 'Your saved products', href: '/account/wishlist' },
    { icon: Settings, label: 'Settings', desc: 'Manage your account', href: '/account/settings' },
  ];

  return (
    <PageTransition>
      <div className='max-w-2xl mx-auto px-4 py-8'>
        {/* Profile header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='bg-gradient-to-br from-brand-600 to-brand-500 rounded-3xl p-8 text-white mb-6'
        >
          <div className='flex items-center gap-5'>
            <div className='w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-3xl font-bold'>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className='text-2xl font-bold'>{user.name}</h1>
              <p className='text-white/80 mt-1'>{user.email}</p>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${user.role === 'admin' ? 'bg-yellow-400 text-yellow-900' : 'bg-white/20'}`}>
                {user.role === 'admin' ? '⭐ Admin' : '👤 Customer'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Menu items */}
        <div className='space-y-3 mb-6'>
          {menuItems.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link href={item.href}
                className='flex items-center gap-4 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow group'
              >
                <div className='w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center group-hover:bg-brand-100 transition-colors'>
                  <item.icon size={22} className='text-brand-500' />
                </div>
                <div className='flex-1'>
                  <p className='font-semibold text-gray-900'>{item.label}</p>
                  <p className='text-gray-500 text-sm'>{item.desc}</p>
                </div>
                <ChevronRight size={20} className='text-gray-400 group-hover:text-brand-500 transition-colors' />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Admin link */}
        {user.role === 'admin' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className='mb-6'
          >
            <Link href='/admin'
              className='flex items-center gap-4 bg-yellow-50 border border-yellow-200 rounded-2xl p-5 hover:bg-yellow-100 transition-colors'
            >
              <div className='w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center'>
                <span className='text-2xl'>⚙️</span>
              </div>
              <div className='flex-1'>
                <p className='font-semibold text-yellow-900'>Admin Dashboard</p>
                <p className='text-yellow-700 text-sm'>Manage products, orders, users</p>
              </div>
              <ChevronRight size={20} className='text-yellow-500' />
            </Link>
          </motion.div>
        )}

        {/* Logout */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={handleLogout}
          className='w-full flex items-center justify-center gap-2 border-2 border-red-100 text-red-500 font-semibold py-4 rounded-2xl hover:bg-red-50 transition-colors'
        >
          <LogOut size={18} />
          Sign Out
        </motion.button>
      </div>
    </PageTransition>
  );
}
