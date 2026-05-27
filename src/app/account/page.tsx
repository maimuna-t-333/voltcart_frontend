'use client';
import { motion } from 'framer-motion';
import { ShoppingBag, Heart, Settings, LogOut, Shield, ChevronRight, User } from 'lucide-react';
import PageTransition from '@/components/layout/PageTransition';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuth, useRequireAuth } from '@/hooks/useAuth';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 120, damping: 18 } },
};

export default function AccountPage() {
  const { user, isLoading } = useRequireAuth();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  if (isLoading || !user) return null;

  const menuItems = [
    { icon: ShoppingBag, label: 'My Orders', desc: 'Track and manage your orders', href: '/account/orders' },
    { icon: Heart, label: 'Wishlist', desc: 'Your saved products', href: '/account/wishlist' },
    { icon: Settings, label: 'Settings', desc: 'Manage your account', href: '/account/settings' },
  ];

  return (
    <PageTransition>
      <section className='relative overflow-hidden min-h-screen transition-colors duration-400' style={{ background: 'var(--bg)' }}>
        <div className='absolute inset-0 pointer-events-none z-0' aria-hidden>
          <div className='hb-grid-overlay absolute inset-0' />
          <div
            className='absolute rounded-full blur-[120px] pointer-events-none w-[600px] h-[500px] -top-[200px] -left-[200px]'
            style={{ background: 'var(--accent-glow)' }}
          />
          <div
            className='absolute rounded-full blur-[80px] pointer-events-none w-[350px] h-[350px] -bottom-[100px] -right-[100px]'
            style={{ background: 'rgba(139,92,246,0.08)' }}
          />
        </div>

        <div className='relative z-10 max-w-4xl mx-auto px-4 py-8 lg:py-12'>
          {/* Profile header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            className='rounded-3xl p-6 lg:p-8 backdrop-blur-xl mb-8'
            style={{
              background: 'var(--card)',
              border: '1px solid var(--card-bdr)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.06)',
            }}
          >
            <div className='flex items-center gap-5'>
              <div
                className='w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold shrink-0'
                style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className='min-w-0'>
                <h1 className='text-2xl lg:text-3xl font-extrabold tracking-tight truncate' style={{ color: 'var(--tx)' }}>
                  {user.name}
                </h1>
                <p className='text-sm mt-1 truncate' style={{ color: 'var(--tx2)' }}>{user.email}</p>
                <span
                  className='inline-block mt-3 px-3 py-1 rounded-full text-xs font-semibold'
                  style={{
                    background: user.role === 'admin' ? 'rgba(251,191,36,0.15)' : 'var(--accent-dim)',
                    color: user.role === 'admin' ? '#f59e0b' : 'var(--accent)',
                  }}
                >
                  {user.role === 'admin' ? 'Admin' : 'Customer'}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Menu items */}
          <motion.div
            variants={container}
            initial='hidden'
            animate='show'
            className='space-y-3 mb-6'
          >
            {menuItems.map((menu) => (
              <motion.div key={menu.label} variants={item}>
                <Link
                  href={menu.href}
                  className='flex items-center gap-4 rounded-2xl p-5 transition-all duration-200 group'
                  style={{
                    background: 'var(--card)',
                    border: '1px solid var(--card-bdr)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 4px 24px var(--accent-glow)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--card-bdr)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.04)'; }}
                >
                  <div
                    className='w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors'
                    style={{ background: 'var(--accent-dim)' }}
                  >
                    <menu.icon size={22} style={{ color: 'var(--accent)' }} strokeWidth={1.5} />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='font-semibold' style={{ color: 'var(--tx)' }}>{menu.label}</p>
                    <p className='text-sm truncate' style={{ color: 'var(--tx2)' }}>{menu.desc}</p>
                  </div>
                  <ChevronRight
                    size={20}
                    strokeWidth={1.5}
                    className='shrink-0 transition-all duration-200 group-hover:translate-x-0.5'
                    style={{ color: 'var(--tx3)' }}
                  />
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {/* Admin link */}
          {user.role === 'admin' && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 100, damping: 18, delay: 0.3 }}
              className='mb-6'
            >
              <Link
                href='/admin'
                className='flex items-center gap-4 rounded-2xl p-5 transition-all duration-200 group'
                style={{
                  background: 'var(--card)',
                  border: '1px solid rgba(251,191,36,0.2)',
                  boxShadow: '0 4px 20px rgba(251,191,36,0.06)',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#f59e0b'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(251,191,36,0.15)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(251,191,36,0.2)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(251,191,36,0.06)'; }}
              >
                <div
                  className='w-12 h-12 rounded-xl flex items-center justify-center shrink-0'
                  style={{ background: 'rgba(251,191,36,0.12)' }}
                >
                  <Shield size={22} style={{ color: '#f59e0b' }} strokeWidth={1.5} />
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='font-semibold' style={{ color: 'var(--tx)' }}>Admin Dashboard</p>
                  <p className='text-sm truncate' style={{ color: 'var(--tx2)' }}>Manage products, orders, users</p>
                </div>
                <ChevronRight
                  size={20}
                  strokeWidth={1.5}
                  className='shrink-0 transition-all duration-200 group-hover:translate-x-0.5'
                  style={{ color: 'var(--tx3)' }}
                />
              </Link>
            </motion.div>
          )}

          {/* Logout */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 18, delay: 0.4 }}
          >
            <button
              onClick={handleLogout}
              className='w-full flex items-center justify-center gap-2 font-semibold py-4 rounded-2xl transition-all duration-200'
              style={{
                border: '1.5px solid rgba(239,68,68,0.2)',
                color: '#ef4444',
                background: 'transparent',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.06)'; e.currentTarget.style.borderColor = '#ef4444'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'; }}
            >
              <LogOut size={18} strokeWidth={1.5} />
              Sign Out
            </button>
          </motion.div>
        </div>
      </section>
    </PageTransition>
  );
}
