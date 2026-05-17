'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Package, ShoppingBag, Users,
  Tag, BarChart2, Menu, X, ChevronRight, LogOut
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { label: 'Dashboard',  href: '/admin',           icon: LayoutDashboard },
  { label: 'Products',   href: '/admin/products',  icon: Package },
  { label: 'Orders',     href: '/admin/orders',    icon: ShoppingBag },
  { label: 'Customers',  href: '/admin/customers', icon: Users },
  { label: 'Coupons',    href: '/admin/coupons',   icon: Tag },
  { label: 'Analytics',  href: '/admin/analytics', icon: BarChart2 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore(s => s.user);
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user) router.push('/auth/login');
    else if (user.role !== 'admin') router.push('/');
  }, [user]);

  if (!user || user.role !== 'admin') return null;

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const Sidebar = () => (
    <div className='flex flex-col h-full'>
      {/* Logo */}
      <div className='p-6 border-b border-gray-100'>
        <Link href='/' className='text-xl font-bold text-brand-600'>TechVault</Link>
        <p className='text-xs text-gray-400 mt-1'>Admin Panel</p>
      </div>

      {/* Nav */}
      <nav className='flex-1 p-4 space-y-1'>
        {navItems.map(item => {
          const isActive = pathname === item.href ||
            (item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-200'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-brand-600'
              }`}
            >
              <item.icon size={18} />
              {item.label}
              {isActive && <ChevronRight size={14} className='ml-auto' />}
            </Link>
          );
        })}
      </nav>

      {/* User info + logout */}
      <div className='p-4 border-t border-gray-100'>
        <div className='flex items-center gap-3 mb-3'>
          <div className='w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center text-white font-bold text-sm'>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className='flex-1 min-w-0'>
            <p className='text-sm font-semibold text-gray-900 truncate'>{user.name}</p>
            <p className='text-xs text-gray-400 truncate'>{user.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className='w-full flex items-center gap-2 text-sm text-red-500 hover:bg-red-50 px-3 py-2 rounded-xl transition-colors'
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className='flex h-screen bg-gray-50'>
      {/* Desktop sidebar */}
      <aside className='hidden md:flex flex-col w-64 bg-white border-r border-gray-100 shadow-sm flex-shrink-0'>
        <Sidebar />
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='fixed inset-0 bg-black/40 z-40 md:hidden'
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className='fixed left-0 top-0 h-full w-64 bg-white z-50 shadow-2xl md:hidden'
            >
              <Sidebar />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className='flex-1 flex flex-col overflow-hidden'>
        {/* Top bar */}
        <header className='bg-white border-b border-gray-100 px-4 h-16 flex items-center justify-between shadow-sm'>
          <button
            onClick={() => setSidebarOpen(true)}
            className='md:hidden text-gray-600 hover:text-brand-500'
          >
            <Menu size={22} />
          </button>
          <div className='flex items-center gap-2'>
            <span className='text-sm text-gray-500'>Welcome,</span>
            <span className='text-sm font-semibold text-gray-900'>{user.name}</span>
          </div>
          <Link href='/' className='text-sm text-brand-500 hover:underline'>
            View Store →
          </Link>
        </header>

        {/* Page content */}
        <main className='flex-1 overflow-y-auto p-6'>
          {children}
        </main>
      </div>
    </div>
  );
}
