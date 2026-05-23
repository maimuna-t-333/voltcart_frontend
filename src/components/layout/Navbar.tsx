'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, UserCircle, X, ArrowRight, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useCartStore } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { motion, AnimatePresence } from 'framer-motion';

const QUICK_LINKS = [
  { label: 'Our Products', href: '/products' },
  { label: 'New arrivals', href: '/products?sort=newest' },
  { label: 'Top rated', href: '/products?sort=rating' },
];

interface SearchResult {
  id: string;
  name: string;
  category: string;
  price: string;
  emoji: string;
  href: string;
}

const MOCK_RESULTS: SearchResult[] = [
  { id: '1', name: 'Sony WH-1000XM5',    category: 'Headphones', price: '$349',   emoji: '🎧', href: '/products/sony-wh-1000xm5' },
  { id: '2', name: 'Apple MacBook Air M3',category: 'Laptops',    price: '$1,099', emoji: '💻', href: '/products/macbook-air-m3'  },
  { id: '3', name: 'Samsung Galaxy S25',  category: 'Phones',     price: '$799',   emoji: '📱', href: '/products/galaxy-s25'      },
  { id: '4', name: 'NVIDIA RTX 5080',     category: 'GPU',        price: '$999',   emoji: '🖥️', href: '/products/rtx-5080'        },
  { id: '5', name: 'DJI Osmo Pocket 3',   category: 'Camera',     price: '$519',   emoji: '📷', href: '/products/dji-osmo-pocket-3'},
];

function useSearch(query: string) {
  const [results, setResults] = useState<SearchResult[]>([]);
  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const q = query.toLowerCase();
    setResults(MOCK_RESULTS.filter(r =>
      r.name.toLowerCase().includes(q) || r.category.toLowerCase().includes(q)
    ));
  }, [query]);
  return results;
}

export default function Navbar() {
  const [mounted,  setMounted]  = useState(false);
  const [open,     setOpen]     = useState(false);
  const [query,    setQuery]    = useState('');
  const [cursor,   setCursor]   = useState(0);
  const [cartPop,  setCartPop]  = useState(false);
  const inputRef  = useRef<HTMLInputElement>(null);
  const pillRef   = useRef<HTMLDivElement>(null);
  const prevCount = useRef(0);
  const { resolvedTheme, setTheme } = useTheme();
  const count    = useCartStore(s => s.getCount());
  const openCart = useUIStore(s => s.openCart);
  const user     = useAuthStore(s => s.user);
  const router   = useRouter();
  const results  = useSearch(query);
  const isDark = resolvedTheme === 'dark';

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (mounted && count > prevCount.current) {
      setCartPop(true);
      setTimeout(() => setCartPop(false), 500);
    }
    prevCount.current = count;
  }, [count, mounted]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA') {
        e.preventDefault(); expand();
      }
      if (e.key === 'Escape') collapse();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setCursor(c => Math.min(c + 1, results.length - 1)); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setCursor(c => Math.max(c - 1, 0)); }
      if (e.key === 'Enter' && results[cursor]) {
        router.push(results[cursor].href);
        collapse();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, results, cursor]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pillRef.current && !pillRef.current.contains(e.target as Node)) collapse();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const expand = useCallback(() => {
    setOpen(true); setCursor(0);
    setTimeout(() => inputRef.current?.focus(), 60);
  }, []);

  const collapse = useCallback(() => {
    setOpen(false); setQuery(''); setCursor(0);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/products?search=${encodeURIComponent(query.trim())}`);
    collapse();
  };

  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');

  return (
    <>
      <div className='vc-bar'>
        <motion.div
          ref={pillRef}
          className={`vc-pill${open ? ' vc-pill--open' : ''}`}
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 40 }}
        >
          <AnimatePresence mode='wait'>

            {/* ── Idle ── */}
            {!open && (
              <motion.div key='idle' className='vc-idle'
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
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

                  <button className='vc-ico vc-cart' onClick={openCart} aria-label='Cart'>
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

                  <Link href={user ? '/account' : '/auth/login'} className='vc-ico' aria-label='Account'>
                    {user?.photoURL
                      ? <img src={user.photoURL} className='vc-avatar' alt='' />
                      : <UserCircle size={17} />
                    }
                  </Link>

                  {/* ── Theme toggle ── */}
                  {mounted && (
                    <button
                      className='vc-theme-btn'
                      onClick={toggleTheme}
                      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                    >
                      <AnimatePresence mode='wait'>
                        {isDark ? (
                          <motion.span key='moon'
                            initial={{ rotate: -30, opacity: 0, scale: 0.7 }}
                            animate={{ rotate: 0,   opacity: 1, scale: 1   }}
                            exit={{    rotate:  30, opacity: 0, scale: 0.7 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Moon size={14} />
                          </motion.span>
                        ) : (
                          <motion.span key='sun'
                            initial={{ rotate:  30, opacity: 0, scale: 0.7 }}
                            animate={{ rotate: 0,   opacity: 1, scale: 1   }}
                            exit={{    rotate: -30, opacity: 0, scale: 0.7 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Sun size={14} />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* ── Command bar ── */}
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
                      {results.map((r, i) => (
                        <Link key={r.id} href={r.href} onClick={collapse}
                          className={`vc-result${i === cursor ? ' vc-result--active' : ''}`}
                          onMouseEnter={() => setCursor(i)}
                        >
                          <span className='vc-result-em'>{r.emoji}</span>
                          <span className='vc-result-body'>
                            <span className='vc-result-name'>{r.name}</span>
                            <span className='vc-result-cat'>{r.category}</span>
                          </span>
                          <span className='vc-result-price'>{r.price}</span>
                          <ArrowRight size={13} className='vc-result-arrow' />
                        </Link>
                      ))}
                      <Link
                        href={`/products?search=${encodeURIComponent(query)}`}
                        onClick={collapse}
                        className='vc-all-results'
                      >
                        See all results for <strong>"{query}"</strong>
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>

                {query.trim() && results.length === 0 && (
                  <div className='vc-empty'>
                    No results for <strong>"{query}"</strong> — press Enter to search all
                  </div>
                )}

                <div className='vc-hints'>
                  <span className='vc-hint'><kbd>↑↓</kbd> navigate</span>
                  <span className='vc-hint'><kbd>↵</kbd> open</span>
                  <span className='vc-hint'><kbd>esc</kbd> close</span>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </motion.div>
      </div>


    </>
  );
}