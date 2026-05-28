'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, UserCircle, X, ArrowRight, Menu, Smartphone, Laptop, Headphones, Tablet, Watch, Gamepad2, Mouse, Home, Sparkles } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { useSearchProducts } from '@/hooks/useProducts';
import { motion, AnimatePresence } from 'framer-motion';

const QUICK_LINKS = [
  { label: 'Our Products', href: '/products' },
  { label: 'New arrivals', href: '/products?sort=newest' },
  { label: 'Top rated',    href: '/products?sort=rating' },
];

const categoryIcons: Record<string, any> = {
  Smartphones: Smartphone,
  Laptops: Laptop,
  Headphones: Headphones,
  Tablets: Tablet,
  Wearables: Watch,
  Gaming: Gamepad2,
  Accessories: Mouse,
  'Smart Home': Home,
};

function getIcon(category: string) {
  return categoryIcons[category] ?? Sparkles;
}

export default function Navbar() {
  const [mounted,   setMounted]   = useState(false);
  const [open,      setOpen]      = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [query,     setQuery]     = useState('');
  const [debounced, setDebounced] = useState('');
  const [cursor,    setCursor]    = useState(0);
  const [cartPop,   setCartPop]   = useState(false);

  const inputRef  = useRef<HTMLInputElement>(null);
  const pillRef   = useRef<HTMLDivElement>(null);
  const prevCount = useRef(0);
  const count    = useCartStore(s => s.getCount());
  const openCart = useUIStore(s => s.openCart);
  const user     = useAuthStore(s => s.user);
  const router   = useRouter();

  const { data: searchData, isFetching } = useSearchProducts(debounced);
  const results = searchData?.products ?? [];

  // debounce
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 250);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => { setMounted(true); }, []);

  // Cart pop animation
  useEffect(() => {
    if (mounted && count > prevCount.current) {
      setCartPop(true);
      setTimeout(() => setCartPop(false), 500);
    }
    prevCount.current = count;
  }, [count, mounted]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA') {
        e.preventDefault(); expand();
      }
      if (e.key === 'Escape') { collapse(); setMenuOpen(false); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Arrow key / enter nav in search results
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setCursor(c => Math.min(c + 1, results.length - 1)); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setCursor(c => Math.max(c - 1, 0)); }
      if (e.key === 'Enter' && results[cursor]) { router.push(`/products/${results[cursor].slug}`); collapse(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, results, cursor]);

  // Click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pillRef.current && !pillRef.current.contains(e.target as Node)) {
        collapse();
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const expand = useCallback(() => {
    setOpen(true); setMenuOpen(false); setCursor(0);
    setTimeout(() => inputRef.current?.focus(), 60);
  }, []);

  const collapse = useCallback(() => {
    setOpen(false); setQuery(''); setDebounced(''); setCursor(0);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/products?search=${encodeURIComponent(query.trim())}`);
    collapse();
  };

  const handleCartClick = () => {
    if (!user) {
      router.push('/auth/login?redirect=/cart');
      return;
    }
    openCart();
  };

  return (
    <div className='vc-bar'>
      <motion.div
        ref={pillRef}
        className={`vc-pill${open ? ' vc-pill--open' : ''}${menuOpen ? ' vc-pill--menu' : ''}`}
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 40 }}
      >
        <AnimatePresence mode='wait'>

          {/* ── Search / command bar ── */}
          {open && (
            <motion.div key='search' className='vc-command'
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
            >
              <form onSubmit={handleSubmit} className='vc-command-top'>
                <Search size={16} className='vc-command-ico' />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => { setQuery(e.target.value); setCursor(0); }}
                  placeholder='Search gadgets, brands, categories…'
                  className='vc-command-input'
                  autoComplete='off'
                  spellCheck={false}
                />
                <button type='button' onClick={collapse} className='vc-command-close' aria-label='Close'>
                  <X size={15} />
                </button>
              </form>

              <AnimatePresence>
                {results.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{    opacity: 0, height: 0 }}
                    transition={{ duration: 0.18 }}
                    className='vc-results'
                  >
                    {results.map((r, i) => {
                      const Icon = getIcon(r.category);
                      const img = r.variants[0]?.images[0];
                      return (
                        <Link key={r._id} href={`/products/${r.slug}`} onClick={collapse}
                          className={`vc-result${i === cursor ? ' vc-result--active' : ''}`}
                          onMouseEnter={() => setCursor(i)}
                        >
                          <span className='vc-result-em'>
                            {img ? (
                              <Image src={img} alt='' width={20} height={20} className='rounded' />
                            ) : (
                              <Icon size={18} strokeWidth={1.5} />
                            )}
                          </span>
                          <span className='vc-result-body'>
                            <span className='vc-result-name'>{r.name}</span>
                            <span className='vc-result-cat'>{r.brand} &middot; {r.category}</span>
                          </span>
                          <span className='vc-result-price'>${r.basePrice}</span>
                          <ArrowRight size={13} className='vc-result-arrow' />
                        </Link>
                      );
                    })}
                    <Link
                      href={`/products?search=${encodeURIComponent(query)}`}
                      onClick={collapse}
                      className='vc-all-results'
                    >
                      See all results for <strong>&ldquo;{query}&rdquo;</strong>
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>

              {isFetching && (
                <div className='vc-empty'>
                  <span className='animate-pulse'>Searching&hellip;</span>
                </div>
              )}

              {debounced && !isFetching && results.length === 0 && (
                <div className='vc-empty'>
                  No results for <strong>&ldquo;{query}&rdquo;</strong> &mdash; press Enter to search all
                </div>
              )}

              <div className='vc-hints'>
                <span className='vc-hint'><kbd>&uarr;&darr;</kbd> navigate</span>
                <span className='vc-hint'><kbd>&crarr;</kbd> open</span>
                <span className='vc-hint'><kbd>esc</kbd> close</span>
              </div>
            </motion.div>
          )}

          {/* ── Idle bar ── */}
          {!open && (
            <motion.div key='idle'
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <div className='vc-idle'>
                <Link href='/' className='vc-logo'>
                  VoltCart<span className='vc-dot'>.</span>
                </Link>

                <nav className='vc-links'>
                  {QUICK_LINKS.map(l => (
                    <Link key={l.href} href={l.href} className='vc-link'>{l.label}</Link>
                  ))}
                </nav>

                <div className='vc-icons'>
                  <button className='vc-ico' onClick={expand} aria-label='Search (press /)'>
                    <Search size={17} />
                  </button>

                  <button className='vc-ico vc-cart vc-desk-only' onClick={handleCartClick} aria-label='Cart'>
                    <motion.div
                      animate={cartPop ? { scale: [1, 1.4, 0.85, 1.05, 1] } : {}}
                      transition={{ duration: 0.45 }}
                    >
                      <ShoppingCart size={17} />
                    </motion.div>
                    {mounted && count > 0 && (
                      <motion.span key={count} initial={{ scale: 0 }} animate={{ scale: 1 }} className='vc-badge' />
                    )}
                  </button>

                  <Link href={user ? '/account' : '/auth/login'} className='vc-ico vc-desk-only' aria-label='Account'>
                    {user?.photoURL
                      ? <Image src={user.photoURL} width={22} height={22} className='vc-avatar' alt='' />
                      : <UserCircle size={17} />
                    }
                  </Link>

                  <button
                    className='vc-ico vc-hamburger'
                    onClick={() => setMenuOpen(v => !v)}
                    aria-label='Menu'
                    aria-expanded={menuOpen}
                  >
                    <AnimatePresence mode='wait'>
                      {menuOpen
                        ? <motion.span key='x'    initial={{ rotate: -45, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 45, opacity: 0 }} transition={{ duration: 0.15 }}><X    size={17} /></motion.span>
                        : <motion.span key='menu' initial={{ rotate:  45, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate:-45, opacity: 0 }} transition={{ duration: 0.15 }}><Menu size={17} /></motion.span>
                      }
                    </AnimatePresence>
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    className='vc-mobile-menu'
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{    opacity: 0, height: 0 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {/* nav links */}
                    <div className='vc-mobile-group'>
                      {QUICK_LINKS.map(l => (
                        <Link
                          key={l.href}
                          href={l.href}
                          className='vc-mobile-link'
                          onClick={() => setMenuOpen(false)}
                        >
                          <span>{l.label}</span>
                          <ArrowRight size={13} strokeWidth={2} className='vc-mobile-arrow' />
                        </Link>
                      ))}
                    </div>

                    <div className='vc-mobile-divider' />

                    {/* actions */}
                    <div className='vc-mobile-group'>
                      <button
                        className='vc-mobile-link'
                        onClick={() => { setMenuOpen(false); handleCartClick(); }}
                      >
                        <ShoppingCart size={16} strokeWidth={1.8} />
                        <span>Cart</span>
                        {count > 0 && (
                          <span className='vc-mobile-badge'>{count}</span>
                        )}
                      </button>

                      <Link
                        href={user ? '/account' : '/auth/login'}
                        className='vc-mobile-link'
                        onClick={() => setMenuOpen(false)}
                      >
                        <UserCircle size={16} strokeWidth={1.8} />
                        <span>{user ? 'Account' : 'Sign in'}</span>
                      </Link>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </div>
  );
}
