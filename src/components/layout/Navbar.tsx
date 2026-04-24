'use client';
import Link from 'next/link';
import { ShoppingCart, Heart, User, Search } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useUIStore }  from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';

export default function Navbar() {
  const count    = useCartStore(s => s.getCount());
  const openCart = useUIStore(s => s.openCart);
  const user     = useAuthStore(s => s.user);

  return (
    <nav className='sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm'>
      <div className='max-w-7xl mx-auto px-4 h-16 flex items-center justify-between'>
        <Link href='/' className='text-2xl font-bold text-brand-600'>TechVault</Link>
        <div className='hidden md:flex items-center gap-2 flex-1 max-w-lg mx-8'>
          <input placeholder='Search gadgets...'
            className='w-full border border-gray-200 rounded-full px-5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500' />
          <button className='bg-brand-500 text-white p-2 rounded-full hover:bg-brand-600'>
            <Search size={18} />
          </button>
        </div>
        <div className='flex items-center gap-4'>
          <Link href='/account/wishlist'><Heart size={22} className='text-gray-600 hover:text-brand-500' /></Link>
          <button onClick={openCart} className='relative'>
            <ShoppingCart size={22} className='text-gray-600 hover:text-brand-500' />
            {count > 0 && <span className='absolute -top-2 -right-2 bg-brand-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'>{count}</span>}
          </button>
          <Link href={user ? '/account' : '/auth/login'}>
            <User size={22} className='text-gray-600 hover:text-brand-500' />
          </Link>
        </div>
      </div>
    </nav>
  );
}
