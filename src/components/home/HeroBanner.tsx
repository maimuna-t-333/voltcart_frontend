'use client';
import { useRef, useState, useCallback } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Star, Truck, ShieldCheck, Zap } from 'lucide-react';

const SPECS = [
  { label: 'Chip',    value: 'M3 Pro' },
  { label: 'RAM',     value: '18 GB'  },
  { label: 'Battery', value: '22 hr'  },
  { label: 'Display', value: '14"'    },
];

const PERKS = [
  { icon: Truck,       text: 'Free 2-day shipping' },
  { icon: ShieldCheck, text: '2-year warranty'      },
  { icon: Star,        text: '4.9★ rated'           },
];

const MARQUEE = [
  'Free shipping over $49', '50,000+ customers', '2-year warranty',
  'New arrivals weekly',    '4.9★ avg rating',   'Easy 30-day returns',
  'Free shipping over $49', '50,000+ customers', '2-year warranty',
  'New arrivals weekly',    '4.9★ avg rating',   'Easy 30-day returns',
];

export default function HeroBanner() {
  const reduce  = useReducedMotion();
  const ref     = useRef<HTMLElement>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const imgY    = useTransform(scrollYProgress, [0,1], ['0%',  reduce ? '0%' : '-8%' ]);
  const textY   = useTransform(scrollYProgress, [0,1], ['0%',  reduce ? '0%' : '-14%']);
  const fade    = useTransform(scrollYProgress, [0, 0.55], [1, 0]);

  const handleTilt = useCallback((e: React.MouseEvent) => {
    if (reduce) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMouse({ x, y });
  }, [reduce]);

  const handleTiltReset = useCallback(() => {
    setMouse({ x: 0, y: 0 });
  }, []);

  return (
    <section
      ref={ref}
      className='relative overflow-hidden min-h-svh flex flex-col transition-colors duration-400'
      style={{ background: 'var(--bg)' } as React.CSSProperties}
    >
      {/* bg */}
      <div className='absolute inset-0 pointer-events-none z-0' aria-hidden>
        <div
          className='absolute inset-0 opacity-[0.022] mix-blend-overlay'
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
          }}
        />
        <div className='hb-grid-overlay absolute inset-0 pointer-events-none' />
        <div
          className='absolute rounded-full blur-[110px] pointer-events-none transition-colors duration-400 w-[700px] h-[600px] -top-[200px] -left-[200px]'
          style={{ background: 'var(--accent-glow)' }}
        />
        <div
          className='absolute rounded-full blur-[110px] pointer-events-none w-[500px] h-[500px] -bottom-[100px] right-0'
          style={{ background: 'rgba(139,92,246,0.12)' }}
        />
      </div>

      {/* marquee */}
      <div
        className='relative z-10 border-b shrink-0 overflow-hidden h-9 flex items-center'
        style={{
          background: 'var(--ticker-bg)',
          borderColor: 'var(--ticker-bdr)',
        }}
        aria-hidden
      >
        <div className='flex items-center whitespace-nowrap hb-scroll-track motion-reduce:!animate-none'>
          {MARQUEE.map((t, i) => (
            <span key={i} className='inline-flex items-center gap-2 text-[11.5px] font-normal px-8' style={{ color: 'var(--tx2)' }}>
              <Zap size={11} className='shrink-0' style={{ color: 'var(--accent)' }} />
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* main */}
      <div className='relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-2 items-center max-w-[1280px] mx-auto w-full gap-12 px-[clamp(20px,5vw,64px)] py-[clamp(40px,7vw,88px)]'>
        {/* ── LEFT ── */}
        <motion.div className='flex flex-col gap-[26px]' style={{ y: textY, opacity: fade }}>

          <motion.div
            className='inline-flex items-center gap-2 text-[12px] font-medium w-fit rounded-full px-[14px] py-[6px]'
            style={{
              background: 'var(--accent-dim)',
              border: '1px solid rgba(99,102,241,0.22)',
              color: '#a5b4fc',
            }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className='size-[6px] rounded-full bg-[#22c55e] shadow-[0_0_6px_#22c55e] hb-pulse-dot motion-reduce:!animate-none shrink-0' />
            MacBook Air M3 · Now available
          </motion.div>

          <motion.h1
            className='font-display text-[clamp(36px,5.5vw,64px)] font-extrabold leading-[1.08] tracking-[-0.03em] m-0'
            style={{ color: 'var(--tx)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
          >
            Built for what&rsquo;s&nbsp;next.
          </motion.h1>

          <motion.p
            className='font-sans text-[clamp(15px,1.5vw,17px)] font-light leading-[1.75] max-w-[400px] m-0'
            style={{ color: 'var(--tx2)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2 }}
          >
            The thinnest, lightest MacBook Air ever — powered by the&nbsp;M3&nbsp;chip.
            All&nbsp;day battery. All&nbsp;night power.
          </motion.p>

          {/* spec pills */}
          <motion.div
            className='grid grid-cols-2 sm:grid-cols-4 gap-2'
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.28 }}
          >
            {SPECS.map(s => (
              <div
                key={s.label}
                className='flex flex-col gap-[3px] rounded-xl px-[14px] py-[12px]'
                style={{
                  background: 'var(--spec-bg)',
                  border: '1px solid var(--spec-bdr)',
                }}
              >
                <span className='font-display text-[16px] font-bold tracking-[-0.02em]' style={{ color: 'var(--tx)' }}>
                  {s.value}
                </span>
                <span className='font-sans text-[11px] font-normal uppercase tracking-[0.06em]' style={{ color: 'var(--tx2)' }}>
                  {s.label}
                </span>
              </div>
            ))}
          </motion.div>

          {/* price + CTA */}
          <motion.div
            className='flex items-center flex-wrap gap-[14px]'
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.36 }}
          >
            <Link
              href='/products/macbook-air-m3'
              className='inline-flex items-center gap-2 text-[14px] font-semibold text-white px-6 py-3 rounded-xl no-underline transition-all duration-200 hover:-translate-y-0.5'
              style={{
                background: 'var(--accent)',
                boxShadow: '0 4px 20px var(--accent-glow)',
              }}
            >
              Buy now <ArrowRight size={16} strokeWidth={2.2} />
            </Link>
            <Link
              href='/products'
              className='inline-flex items-center text-[14px] font-normal no-underline transition-colors duration-200 pb-[2px]'
              style={{
                color: 'var(--tx2)',
                borderBottom: '1px solid var(--border-hi)',
              }}
            >
              Browse all
            </Link>
          </motion.div>

          {/* perks */}
          <motion.div
            className='flex flex-wrap gap-[10px] pt-1'
            style={{ borderTop: '1px solid var(--border)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.48 }}
          >
            {PERKS.map(p => {
              const Icon = p.icon;
              return (
                <span key={p.text} className='inline-flex items-center gap-[6px] text-[12px] font-normal' style={{ color: 'var(--tx2)' }}>
                  <Icon size={13} className='shrink-0' style={{ color: 'var(--accent)' }} />
                  {p.text}
                </span>
              );
            })}
          </motion.div>
        </motion.div>

        {/* ── RIGHT — product image ── */}
        <motion.div
          className='relative flex items-center justify-center min-h-[360px]'
          style={{
            y: imgY,
            transform: reduce
              ? 'none'
              : `perspective(1200px) rotateX(${mouse.y * -5}deg) rotateY(${mouse.x * 5}deg)`,
          }}
          initial={{ opacity: 0, scale: 0.96, y: 24 }}
          animate={{ opacity: 1, scale: 1,    y: 0  }}
          transition={{ duration: 0.75, delay: 0.15, ease: [.22,1,.36,1] }}
          onMouseMove={handleTilt}
          onMouseLeave={handleTiltReset}
        >
          {/* glow behind image */}
          <motion.div
            className='absolute inset-[2%_-10%] rounded-full blur-[70px] z-0'
            style={{
              background: 'radial-gradient(ellipse at center, var(--accent-glow) 0%, transparent 70%)',
            }}
            aria-hidden
            animate={reduce ? {} : { scale: [1, 1.04, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* product image */}
          <div className='relative w-full max-w-[620px] aspect-[16/10] z-1'>
            <Image
              src='/laptop.png'
              alt='MacBook Air M3'
              fill
              priority
              unoptimized
              className='hb-img-transform'
              sizes='(max-width:960px) 90vw, 50vw'
            />
            <div
              className='absolute -bottom-[6%] -left-[4%] -right-[4%] h-[14%] z-[-1] pointer-events-none'
              style={{
                background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.2) 0%, transparent 70%)',
                filter: 'blur(14px)',
                transform: 'rotateX(50deg) rotateY(4deg)',
              }}
              aria-hidden
            />
            <div
              className='absolute inset-0 z-1 pointer-events-none rounded-xl'
              style={{
                background: 'radial-gradient(ellipse at 40% 30%, rgba(99,102,241,0.06) 0%, transparent 60%)',
                mixBlendMode: 'screen',
              }}
              aria-hidden
            />
          </div>

          {/* floating review card */}
          <motion.div
            className='absolute z-2 rounded-2xl px-[18px] py-[14px] backdrop-blur-[20px] left-[-4%] top-[10%] max-sm:left-0'
            style={{
              background: 'var(--card)',
              border: '1px solid var(--card-bdr)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
            }}
            initial={{ opacity: 0, x: -16, y: 8 }}
            animate={{ opacity: 1, x: 0,   y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <div className='text-[#f59e0b] text-[13px] tracking-[1px] mb-1'>★★★★★</div>
            <p className='font-sans text-[12.5px] font-medium max-w-45 m-0 mb-0.75' style={{ color: 'var(--tx)' }}>
              &ldquo;Insanely fast, stays cool.&rdquo;
            </p>
            <p className='font-sans text-[11px] font-normal m-0' style={{ color: 'var(--tx2)' }}>
              — Verified buyer
            </p>
          </motion.div>

          {/* floating price card */}
          <motion.div
            className='absolute z-2 rounded-2xl px-[18px] py-[14px] backdrop-blur-[20px] bottom-[8%] right-[-4%] max-sm:right-0'
            style={{
              background: 'var(--card)',
              border: '1px solid var(--card-bdr)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
            }}
            initial={{ opacity: 0, x: 16, y: 8 }}
            animate={{ opacity: 1, x: 0,  y: 0 }}
            transition={{ delay: 1.0, duration: 0.5 }}
          >
            <span className='font-display text-[28px] font-extrabold tracking-[-0.03em] leading-[1.1]' style={{ color: 'var(--tx)' }}>
              $1,099
            </span>
            <div className='flex items-center gap-2 mt-1.5'>
              <span className='font-sans text-[15px] font-normal line-through' style={{ color: 'var(--price-old)' }}>
                $1,299
              </span>
              <span className='font-sans text-[10.5px] font-bold text-white bg-[#22c55e] px-2 py-[2px] rounded-full tracking-[0.02em] leading-[1.4]'>
                Save $200
              </span>
            </div>
          </motion.div>

          {/* floating deal tag */}
          <motion.div
            className='absolute z-2 rounded-2xl px-[18px] py-[14px] backdrop-blur-[20px] bottom-[8%] left-[10%] text-left max-sm:left-0'
            style={{
              background: 'var(--card)',
              border: '1px solid var(--card-bdr)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
            }}
            initial={{ opacity: 0, x: -16, y: 8 }}
            animate={{ opacity: 1, x: 0,  y: 0 }}
            transition={{ delay: 0.85, duration: 0.5 }}
          >
            <span className='block text-[11px] font-medium uppercase tracking-[0.08em] mb-1' style={{ color: 'var(--tx2)' }}>
              Limited offer
            </span>
            <span className='font-display text-[22px] font-extrabold tracking-[-0.03em] text-transparent bg-clip-text bg-gradient-to-r from-[#f59e0b] to-[#ef4444]'>
              15% OFF
            </span>
          </motion.div>
        </motion.div>
      </div>

      {/* bottom ticker */}
      <div
        className='relative z-10 border-t shrink-0 overflow-hidden h-9 flex items-center'
        style={{
          background: 'var(--ticker-bg)',
          borderColor: 'var(--ticker-bdr)',
        }}
        aria-hidden
      >
        <div className='flex items-center whitespace-nowrap hb-scroll-track hb-scroll-track--rev motion-reduce:!animate-none'>
          {MARQUEE.map((t, i) => (
            <span key={i} className='inline-flex items-center gap-2 text-[11.5px] font-normal px-8' style={{ color: 'var(--tx2)' }}>
              <Zap size={11} className='shrink-0' style={{ color: 'var(--accent)' }} />
              {t}
            </span>
          ))}
        </div>
      </div>

    </section>
  );
}
