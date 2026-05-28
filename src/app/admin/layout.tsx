'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Package, ShoppingBag, Users,
  Tag, BarChart2, Menu, X, ChevronRight, LogOut, Bolt
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

  if (!user) { router.push('/auth/login'); return null; }
  if (user.role !== 'admin') { router.push('/'); return null; }

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const Sidebar = () => (
    <div className='flex flex-col h-full'>
      <div className='px-5 py-6 border-b' style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <Link href='/' className='flex items-center gap-2.5'>
          <div className='w-8 h-8 rounded-lg flex items-center justify-center'
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <Bolt size={16} className='text-white' />
          </div>
          <div>
            <span className='text-base font-bold tracking-tight text-white'>VoltCart</span>
            <p className='text-[10px] tracking-wider uppercase' style={{ color: 'rgba(255,255,255,0.35)' }}>Admin Panel</p>
          </div>
        </Link>
      </div>

      <nav className='flex-1 p-3 space-y-0.5 overflow-y-auto'>
        {navItems.map(item => {
          const isActive = pathname === item.href ||
            (item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className='flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group'
              style={{
                background: isActive ? 'rgba(99,102,241,0.12)' : 'transparent',
                color: isActive ? '#818cf8' : 'rgba(255,255,255,0.5)',
              }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}}
            >
              <item.icon size={17} strokeWidth={1.5} />
              <span className='flex-1'>{item.label}</span>
              {isActive && <ChevronRight size={13} strokeWidth={2} style={{ color: '#818cf8' }} />}
            </Link>
          );
        })}
      </nav>

      <div className='p-3 border-t' style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className='rounded-xl p-3' style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div className='flex items-center gap-3 mb-2.5'>
            <div className='w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white shrink-0'
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-semibold text-white/80 truncate'>{user.name}</p>
              <p className='text-xs text-white/30 truncate'>{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className='w-full flex items-center justify-center gap-2 text-xs font-medium rounded-lg py-2 transition-all duration-200'
            style={{
              color: 'rgba(248,113,113,0.7)',
              background: 'rgba(248,113,113,0.08)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.15)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.08)'; }}
          >
            <LogOut size={13} strokeWidth={1.5} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className='flex h-screen' style={{ background: 'var(--bg)' }}>
      {/* Desktop sidebar */}
      <aside className='hidden md:flex flex-col w-60 shrink-0'
        style={{
          background: 'linear-gradient(180deg, #0c0a1a 0%, #13102e 50%, #0f0c1e 100%)',
        }}>
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
              className='fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm'
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className='fixed left-0 top-0 h-full w-60 z-50 md:hidden'
              style={{ background: 'linear-gradient(180deg, #0c0a1a 0%, #13102e 50%, #0f0c1e 100%)' }}
            >
              <Sidebar />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main area */}
      <div className='flex-1 flex flex-col overflow-hidden'>
        {/* Top bar */}
        <header className='h-14 flex items-center justify-between px-4 shrink-0'
          style={{ background: 'var(--surface)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border)' }}>
          <div className='flex items-center gap-3'>
            <button onClick={() => setSidebarOpen(true)} className='md:hidden' style={{ color: 'var(--tx2)' }}>
              <Menu size={20} />
            </button>
            <span className='text-xs font-medium' style={{ color: 'var(--tx3)' }}>
              Welcome back, <span className='font-semibold' style={{ color: 'var(--tx)' }}>{user.name}</span>
            </span>
          </div>
          <Link href='/' className='text-xs font-medium transition-colors' style={{ color: 'var(--accent)' }}>
            View Store &rarr;
          </Link>
        </header>

        {/* Page content */}
        <main className='flex-1 overflow-y-auto'>{children}</main>
      </div>
    </div>
  );
}
