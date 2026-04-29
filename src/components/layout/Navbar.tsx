'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Heart, User, Search, X, Menu } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useUIStore }  from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const count    = useCartStore(s => s.getCount());
  const openCart = useUIStore(s => s.openCart);
  const user     = useAuthStore(s => s.user);
  const router   = useRouter();

  useEffect(() => setMounted(true), []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowMobileSearch(false);
      setSearchQuery('');
    }
  };

  return (
    <nav className='sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm'>
      <div className='max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4'>
        <Link href='/' className='text-2xl font-bold text-brand-600 flex-shrink-0'>TechVault</Link>

        {/* Desktop search */}
        <form onSubmit={handleSearch} className='hidden md:flex items-center gap-2 flex-1 max-w-lg'>
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder='Search gadgets...'
            className='w-full border border-gray-200 rounded-full px-5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500'
          />
          <button type='submit' className='bg-brand-500 text-white p-2 rounded-full hover:bg-brand-600 flex-shrink-0'>
            <Search size={18} />
          </button>
        </form>

        {/* Right icons */}
        <div className='flex items-center gap-3'>
          {/* Mobile search toggle */}
          <button onClick={() => setShowMobileSearch(!showMobileSearch)} className='md:hidden text-gray-600 hover:text-brand-500'>
            {showMobileSearch ? <X size={22} /> : <Search size={22} />}
          </button>
          <Link href='/account/wishlist' className='hidden sm:block'>
            <Heart size={22} className='text-gray-600 hover:text-brand-500' />
          </Link>
          <button onClick={openCart} className='relative'>
            <ShoppingCart size={22} className='text-gray-600 hover:text-brand-500' />
            {mounted && count > 0 && (
              <span className='absolute -top-2 -right-2 bg-brand-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'>
                {count}
              </span>
            )}
          </button>
          <Link href={user ? '/account' : '/auth/login'}>
            <User size={22} className='text-gray-600 hover:text-brand-500' />
          </Link>
        </div>
      </div>

      {/* Mobile search bar */}
      <AnimatePresence>
        {showMobileSearch && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className='md:hidden border-t border-gray-100 overflow-hidden'
          >
            <form onSubmit={handleSearch} className='flex gap-2 p-3'>
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder='Search gadgets...'
                autoFocus
                className='flex-1 border border-gray-200 rounded-full px-5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500'
              />
              <button type='submit' className='bg-brand-500 text-white p-2 rounded-full hover:bg-brand-600'>
                <Search size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}