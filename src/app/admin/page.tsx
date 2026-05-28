'use client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ShoppingBag, Users, DollarSign, Package, ArrowRight,
  TrendingUp, Calendar, Clock, ShoppingCart, Activity,
  Zap, Cpu, Radio, Wifi
} from 'lucide-react';
import PageTransition from '@/components/layout/PageTransition';
import api from '@/lib/axios';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import { useRequireAdmin } from '@/hooks/useAuth';
import { useRef, useState, useEffect, useMemo } from 'react';

/* ════════════════════════════════════════════════════════════
   CountUp
   ════════════════════════════════════════════════════════════ */
function CountUp({ value, prefix = '' }: { value: number; prefix?: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<number>(null);
  const from = useRef(0);
  useEffect(() => {
    const start = performance.now();
    const dur = 900;
    const fromVal = from.current;
    from.current = value;
    const tick = (now: number) => {
      const t = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(fromVal + (value - fromVal) * eased));
      if (t < 1) ref.current = requestAnimationFrame(tick);
    };
    ref.current = requestAnimationFrame(tick);
    return () => { if (ref.current) cancelAnimationFrame(ref.current); };
  }, [value]);
  return <>{prefix}{display}</>;
}

/* ════════════════════════════════════════════════════════════
   Circuit SVG decorations
   ════════════════════════════════════════════════════════════ */
function CircuitLines() {
  return (
    <svg className='absolute inset-0 w-full h-full pointer-events-none opacity-[0.04]' preserveAspectRatio='none'>
      <path d='M0,40 Q100,20 200,60 T400,30 T600,70 T800,20' fill='none' stroke='var(--accent)' strokeWidth='0.5' />
      <path d='M0,80 Q150,50 250,90 T500,60 T700,100 T900,50' fill='none' stroke='var(--accent)' strokeWidth='0.4' />
      <circle cx='200' cy='60' r='2' fill='var(--accent)' opacity='0.3' />
      <circle cx='500' cy='60' r='1.5' fill='var(--accent)' opacity='0.2' />
      <circle cx='800' cy='30' r='2' fill='var(--accent)' opacity='0.25' />
    </svg>
  );
}

/* ════════════════════════════════════════════════════════════
   LED Dot
   ════════════════════════════════════════════════════════════ */
function LedDot({ color = '#22c55e', pulse = true }: { color?: string; pulse?: boolean }) {
  return (
    <span className='relative inline-block w-2 h-2 rounded-full shrink-0'
      style={{
        background: color,
        boxShadow: `0 0 6px ${color}`,
        animation: pulse ? 'led-pulse 2s ease-in-out infinite' : 'none',
      }}
    />
  );
}

/* ════════════════════════════════════════════════════════════
   Oscilloscope Chart
   ════════════════════════════════════════════════════════════ */
function OscilloscopeChart({ data, color = '#22c55e', height = 120 }: { data: number[]; color?: string; height?: number }) {
  const w = 240;
  const max = Math.max(...data, 1);
  const min = 0;
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = height - ((v - min) / range) * height * 0.85 - height * 0.08;
    return `${x},${y}`;
  }).join(' ');
  const area = `M0,${height} ${pts} ${w},${height}Z`;

  return (
    <svg width='100%' height={height} viewBox={`0 0 ${w} ${height}`} preserveAspectRatio='none'
      className='w-full' style={{ filter: 'drop-shadow(0 0 8px rgba(34,197,94,0.15))' }}>
      <defs>
        <linearGradient id='osc-glow' x1='0' y1='0' x2='0' y2='1'>
          <stop offset='0%' stopColor={color} stopOpacity='0.4' />
          <stop offset='100%' stopColor={color} stopOpacity='0' />
        </linearGradient>
        <filter id='oscBlur'><feGaussianBlur stdDeviation='1.5' /></filter>
      </defs>
      {/* Grid lines */}
      {[0.25, 0.5, 0.75].map(r => (
        <line key={r} x1='0' y1={height * r} x2={w} y2={height * r}
          stroke={color} strokeWidth='0.3' opacity='0.15' strokeDasharray='4 4' />
      ))}
      {/* Area fill */}
      <path d={area} fill='url(#osc-glow)' />
      {/* Glow line */}
      <polyline fill='none' stroke={color} strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round'
        points={pts} opacity='0.5' filter='url(#oscBlur)' />
      {/* Core line */}
      <polyline fill='none' stroke={color} strokeWidth='1.2' strokeLinecap='round' strokeLinejoin='round'
        points={pts} opacity='0.85' />
    </svg>
  );
}

/* ════════════════════════════════════════════════════════════
   Device Spec Card
   ════════════════════════════════════════════════════════════ */
interface SpecCardProps {
  index: number;
  label: string;
  value: number;
  icon: React.ElementType;
  accent: string;
  format?: 'number' | 'currency';
  subtitle?: string;
  isLoading?: boolean;
}
function SpecCard({ index, label, value, icon: Icon, accent, format = 'number', subtitle, isLoading }: SpecCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, type: 'spring', stiffness: 200, damping: 24 }}
      className='relative rounded-2xl p-5 overflow-hidden group cursor-default border'
      style={{
        background: 'var(--card)',
        borderColor: `var(--card-bdr)`,
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = `${accent}25`; e.currentTarget.style.boxShadow = `0 0 0 1px ${accent}08`; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--card-bdr)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <CircuitLines />
      {/* Top accent line */}
      <div className='absolute top-0 left-4 right-4 h-[2px] rounded-full opacity-60'
        style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }} />
      <div className='relative z-10'>
        <div className='flex items-start justify-between mb-4'>
          <div className='w-9 h-9 rounded-xl flex items-center justify-center'
            style={{ background: `${accent}10` }}>
            <Icon size={16} style={{ color: accent }} strokeWidth={1.5} />
          </div>
                          <span className='hidden sm:inline text-[9px] font-mono uppercase tracking-widest' style={{ color: 'var(--tx3)' }}>
                            SPEC-{String(index + 1).padStart(2, '0')}
                          </span>
        </div>
        {isLoading ? (
          <div className='space-y-2'>
            <div className='h-7 w-24 animate-pulse rounded' style={{ background: 'var(--border)' }} />
            <div className='h-3.5 w-16 animate-pulse rounded' style={{ background: 'var(--border)' }} />
          </div>
        ) : (
          <>
            <p className='text-2xl font-extrabold tracking-tight font-mono' style={{ color: 'var(--tx)' }}>
              {format === 'currency' ? <>{formatPrice(value)}</> : <CountUp value={value} />}
            </p>
            <p className='text-xs font-medium mt-0.5' style={{ color: accent }}>{label}</p>
            {subtitle && <p className='text-[10px] mt-1 font-mono' style={{ color: 'var(--tx3)' }}>{subtitle}</p>}
          </>
        )}
      </div>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════
   Avatar helpers
   ════════════════════════════════════════════════════════════ */
const hashColors = ['#6366f1','#8b5cf6','#ec4899','#f43f5e','#f97316','#22c55e','#14b8a6','#3b82f6','#eab308','#a855f7'];
function hashColor(name: string) {
  const hash = name.split('').reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0);
  return hashColors[Math.abs(hash) % hashColors.length];
}

function ProductAvatar({ name, image }: { name: string; image?: string }) {
  if (image) {
    return (
      <div className='w-9 h-9 rounded-lg overflow-hidden shrink-0' style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <Image src={image} alt='' width={36} height={36} className='object-cover w-full h-full' unoptimized />
      </div>
    );
  }
  const c = hashColor(name);
  return (
    <div className='w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0' style={{ background: `${c}12`, color: c }}>
      {name[0].toUpperCase()}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   Skeleton
   ════════════════════════════════════════════════════════════ */
function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg ${className ?? ''}`} style={{ background: 'var(--border)' }} />;
}

/* ════════════════════════════════════════════════════════════
   Category Bar
   ════════════════════════════════════════════════════════════ */
function CategoryBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className='flex items-center gap-3'>
      <span className='text-xs font-medium w-16 sm:w-24 truncate shrink-0' style={{ color: 'var(--tx)' }}>{label}</span>
      <div className='flex-1 h-2 rounded-full overflow-hidden' style={{ background: 'var(--surface)' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className='h-full rounded-full'
          style={{ background: `linear-gradient(90deg, ${color}, ${color}88)` }}
        />
      </div>
      <span className='text-xs font-mono font-bold w-8 text-right' style={{ color: 'var(--tx2)' }}>{count}</span>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   PAGE
   ════════════════════════════════════════════════════════════ */
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
      const { data } = await api.get('/products?limit=6&sort=newest');
      return data.data;
    },
    enabled: !!user,
  });

  const { data: recentOrders, isLoading: loadingOrders } = useQuery({
    queryKey: ['admin', 'recentOrders'],
    queryFn: async () => {
      const { data } = await api.get('/admin/dashboard/orders');
      return data.data;
    },
    enabled: !!user,
  });

  if (!user || user.role !== 'admin') return null;

  const isNum = (v: any): v is number => typeof v === 'number';

  /* Derive categories from products */
  const categories = useMemo(() => {
    const products: any[] = recentProducts?.products || [];
    const map = new Map<string, number>();
    products.forEach((p: any) => {
      if (p.category) map.set(p.category, (map.get(p.category) || 0) + 1);
    });
    const total = products.length || 1;
    const catColors = ['#6366f1','#8b5cf6','#ec4899','#f97316','#22c55e','#14b8a6'];
    return Array.from(map.entries()).map(([label, count], i) => ({
      label, count, total,
      color: catColors[i % catColors.length],
    }));
  }, [recentProducts]);

  /* Specs */
  const specs = [
    { label: 'Products',  value: kpi?.totalProducts ?? 0, icon: Package,     accent: '#6366f1', subtitle: 'active listings' },
    { label: 'Orders',    value: kpi?.totalOrders ?? 0,   icon: ShoppingBag, accent: '#8b5cf6', subtitle: `${kpi?.todayOrders ?? 0} today` },
    { label: 'Revenue',   value: kpi?.totalRevenue ?? 0,  icon: DollarSign,  accent: '#22c55e', format: 'currency' as const, subtitle: `${kpi?.todayRevenue ? `$${kpi.todayRevenue.toFixed(2)}` : '$0'} today` },
    { label: 'Customers', value: kpi?.totalUsers ?? 0,    icon: Users,       accent: '#f59e0b', subtitle: 'registered accounts' },
  ];

  /* Today stats */
  const todayStats = [
    { label: 'Revenue',  value: kpi?.todayRevenue,       icon: DollarSign,   accent: '#22c55e' },
    { label: 'Orders',   value: kpi?.todayOrders,        icon: ShoppingCart, accent: '#6366f1' },
    { label: 'Avg Order', value: kpi?.averageOrderValue,  icon: TrendingUp,   accent: '#f59e0b' },
  ];

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
  const timeStr = today.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <PageTransition>
      <div className='relative min-h-full'>
        {/* Grid + circuit overlay */}
        <div className='fixed inset-0 pointer-events-none'>
          <div className='absolute inset-0 opacity-[0.012]'
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, var(--tx) 1px, transparent 0)',
              backgroundSize: '28px 28px',
            }}
          />
          {/* Circuit trace pattern */}
          <svg className='absolute inset-0 w-full h-full opacity-[0.02]' preserveAspectRatio='none'>
            <path d='M0,100 Q200,40 400,120 T800,80 T1200,140 T1600,60' fill='none' stroke='var(--accent)' strokeWidth='1' />
            <path d='M0,160 Q300,90 500,200 T900,120 T1300,220 T1800,140' fill='none' stroke='var(--accent)' strokeWidth='0.6' />
            {[150, 400, 600, 900, 1200].map((x, i) => (
              <circle key={i} cx={x} cy={[100,120,80,140,60][i]} r='2.5' fill='var(--accent)' opacity='0.08' />
            ))}
          </svg>
        </div>

        <div className='relative z-10 p-6 lg:p-8 max-w-7xl mx-auto'>
          {/* ─── HEADER ─── */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className='flex items-start justify-between mb-7'
          >
            <div>
              <div className='flex items-center gap-2.5 mb-1'>
                <div className='flex items-center gap-1.5 px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider'
                  style={{ background: `${kpi ? '#22c55e' : 'var(--tx3)'}12`, color: kpi ? '#22c55e' : 'var(--tx3)' }}>
                  <LedDot color={kpi ? '#22c55e' : 'var(--tx3)'} pulse={!!kpi} />
                  {kpi ? 'System Online' : 'Connecting...'}
                </div>
              </div>
              <h1 className='text-xl font-extrabold tracking-tight' style={{ color: 'var(--tx)', fontFamily: 'var(--font-family-display)' }}>
                Command Center
              </h1>
              <div className='flex items-center gap-2 mt-0.5'>
                <span className='text-xs font-mono' style={{ color: 'var(--tx3)' }}>{dateStr}</span>
                <span className='text-[9px] font-mono px-1 py-0.5 rounded' style={{ background: 'var(--surface)', color: 'var(--tx3)' }}>{timeStr}</span>
              </div>
            </div>
            <Link href='/admin/products/new'
              className='flex items-center gap-2 font-semibold px-4 py-2 rounded-xl text-white transition-all duration-200 text-sm whitespace-nowrap active:scale-[0.97]'
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}
            >
              <Zap size={14} strokeWidth={2} />
              New Product
            </Link>
          </motion.div>

          {/* ─── STATUS STRIP ─── */}
          {kpi && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className='flex items-center gap-3 sm:gap-5 mb-7 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl flex-wrap text-[11px] sm:text-xs'
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <div className='flex items-center gap-2 text-xs font-medium' style={{ color: 'var(--tx2)' }}>
                <Radio size={12} strokeWidth={1.5} className='text-[#22c55e]' />
                All systems nominal
              </div>
              <div className='w-px h-4' style={{ background: 'var(--border)' }} />
              <div className='flex items-center gap-1.5 text-xs' style={{ color: 'var(--tx3)' }}>
                <Package size={11} strokeWidth={1.5} />
                {kpi.totalProducts} products
              </div>
              <div className='w-px h-4' style={{ background: 'var(--border)' }} />
              <div className='flex items-center gap-1.5 text-xs' style={{ color: 'var(--tx3)' }}>
                <ShoppingCart size={11} strokeWidth={1.5} />
                {kpi.todayOrders} orders today
              </div>
              <div className='w-px h-4' style={{ background: 'var(--border)' }} />
              <div className='flex items-center gap-1.5 text-xs' style={{ color: 'var(--tx3)' }}>
                <DollarSign size={11} strokeWidth={1.5} />
                {formatPrice(kpi.todayRevenue || 0)} today
              </div>
              <div className='w-px h-4' style={{ background: 'var(--border)' }} />
              <div className='flex items-center gap-1.5 text-xs' style={{ color: 'var(--tx3)' }}>
                <Wifi size={11} strokeWidth={1.5} />
                {kpi.totalUsers} active users
              </div>
            </motion.div>
          )}

          {/* ─── KPI SPEC CARDS ─── */}
          <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7'>
            {specs.map((spec, i) => (
              <SpecCard
                key={spec.label}
                index={i}
                label={spec.label}
                value={isNum(spec.value) ? spec.value : 0}
                icon={spec.icon}
                accent={spec.accent}
                format={spec.format}
                subtitle={spec.subtitle}
                isLoading={loadingKpi}
              />
            ))}
          </div>

          {/* ─── MIDDLE ROW: Oscilloscope + Today's Stats + Categories ─── */}
          <div className='grid lg:grid-cols-3 gap-5 mb-7'>
            {/* Oscilloscope / Revenue Chart */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className='lg:col-span-2 rounded-2xl p-5 border'
              style={{ background: 'var(--card)', borderColor: 'var(--card-bdr)' }}
            >
              <div className='flex items-center justify-between mb-4'>
                <div className='flex items-center gap-2.5'>
                  <div className='w-7 h-7 rounded-lg flex items-center justify-center' style={{ background: 'rgba(34,197,94,0.1)' }}>
                    <Activity size={13} style={{ color: '#22c55e' }} strokeWidth={1.5} />
                  </div>
                  <div>
                    <span className='text-[10px] font-bold uppercase tracking-wider' style={{ color: 'var(--tx2)' }}>Revenue Trend</span>
                    <p className='text-lg font-extrabold font-mono' style={{ color: 'var(--tx)' }}>
                      {kpi ? formatPrice(kpi.totalRevenue) : '$0'}
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <span className='text-[10px] font-mono' style={{ color: 'var(--tx3)' }}>LIVE</span>
                  <LedDot color='#22c55e' />
                </div>
              </div>
              <OscilloscopeChart
                data={[1200, 1800, 1400, 2200, 1900, 2600, 3100, 2500, 3600, 4000, 3200, 4500, 5100, 4200, 5800, 6200, 5400, 7000, 6800, 7500]}
                color='#22c55e'
                height={140}
              />
              <div className='flex items-center justify-between mt-3 text-[10px] font-mono overflow-hidden' style={{ color: 'var(--tx3)' }}>
                <span className='hidden sm:inline'>JAN 12</span>
                <span>FEB 01</span>
                <span>FEB 15</span>
                <span>MAR 01</span>
                <span>MAR 15</span>
                <span className='hidden sm:inline'>APR 01</span>
              </div>
            </motion.div>

            {/* Right panel: Today's Stats + Category breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className='space-y-4'
            >
              {/* Today's stats */}
              <div className='rounded-2xl p-4 border' style={{ background: 'var(--card)', borderColor: 'var(--card-bdr)' }}>
                <div className='flex items-center gap-2 mb-3'>
                  <Clock size={12} style={{ color: 'var(--tx3)' }} strokeWidth={1.5} />
                  <span className='text-[10px] font-bold uppercase tracking-wider' style={{ color: 'var(--tx2)' }}>Today</span>
                </div>
                <div className='space-y-2.5'>
                  {kpi ? todayStats.map(s => (
                    <div key={s.label} className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <div className='w-6 h-6 rounded-md flex items-center justify-center' style={{ background: `${s.accent}10` }}>
                          <s.icon size={11} style={{ color: s.accent }} strokeWidth={1.5} />
                        </div>
                        <span className='text-xs' style={{ color: 'var(--tx2)' }}>{s.label}</span>
                      </div>
                      <span className='text-xs font-extrabold font-mono' style={{ color: 'var(--tx)' }}>
                        {s.label === 'Revenue' || s.label === 'Avg Order' ? formatPrice(s.value ?? 0) : <CountUp value={s.value ?? 0} />}
                      </span>
                    </div>
                  )) : (
                    [...Array(3)].map((_, i) => (
                      <div key={i} className='flex items-center justify-between'>
                        <Skeleton className='h-4 w-20' />
                        <Skeleton className='h-4 w-14' />
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Category breakdown */}
              {categories.length > 0 && (
                <div className='rounded-2xl p-4 border' style={{ background: 'var(--card)', borderColor: 'var(--card-bdr)' }}>
                  <div className='flex items-center gap-2 mb-3'>
                    <Package size={12} style={{ color: 'var(--tx3)' }} strokeWidth={1.5} />
                    <span className='text-[10px] font-bold uppercase tracking-wider' style={{ color: 'var(--tx2)' }}>Categories</span>
                  </div>
                  <div className='space-y-2.5'>
                    {categories.map(c => (
                      <CategoryBar key={c.label} {...c} />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* ─── BOTTOM ROW: Recent Products + Orders ─── */}
          <div className='grid lg:grid-cols-2 gap-5'>
            {/* Recent Products */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className='rounded-2xl overflow-hidden border'
              style={{ background: 'var(--card)', borderColor: 'var(--card-bdr)' }}
            >
              <div className='flex items-center justify-between px-5 py-3.5 border-b' style={{ borderColor: 'var(--card-bdr)' }}>
                <div className='flex items-center gap-2.5'>
                  <Cpu size={13} style={{ color: 'var(--tx3)' }} strokeWidth={1.5} />
                  <span className='text-[10px] font-bold uppercase tracking-wider' style={{ color: 'var(--tx2)' }}>Latest Inventory</span>
                </div>
                <Link href='/admin/products' className='text-[10px] font-semibold font-mono' style={{ color: 'var(--accent)' }}>
                  VIEW ALL &rarr;
                </Link>
              </div>
              <div className='divide-y' style={{ borderColor: 'var(--card-bdr)' }}>
                {loadingProducts ? (
                  [...Array(4)].map((_, i) => (
                    <div key={i} className='flex items-center gap-3 p-3.5'>
                      <Skeleton className='w-9 h-9' />
                      <div className='flex-1 space-y-1'>
                        <Skeleton className='h-3.5 w-2/5' />
                        <Skeleton className='h-3 w-1/4' />
                      </div>
                      <Skeleton className='h-4 w-14' />
                    </div>
                  ))
                ) : recentProducts?.products?.length ? (
                  recentProducts.products.map((p: any) => (
                    <div key={p._id} className='flex items-center gap-3 p-3.5 transition-colors duration-150'
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <ProductAvatar name={p.name} image={p.images?.[0]} />
                      <div className='flex-1 min-w-0'>
                        <p className='font-medium text-sm truncate' style={{ color: 'var(--tx)' }}>{p.name}</p>
                        <p className='text-xs flex items-center gap-1.5' style={{ color: 'var(--tx3)' }}>
                          {p.category}{p.brand ? ` · ${p.brand}` : ''}
                          <span className='inline-block w-1.5 h-1.5 rounded-full'
                            style={{ background: p.status === 'active' ? '#22c55e' : 'var(--tx3)' }} />
                          <span className='text-[10px]'>{p.status}</span>
                        </p>
                      </div>
                      <div className='text-right shrink-0'>
                        <p className='font-bold text-sm font-mono' style={{ color: 'var(--tx)' }}>{formatPrice(p.basePrice)}</p>
                        <Link href={`/admin/products/${p._id}/edit`} className='text-[10px] font-medium font-mono' style={{ color: 'var(--accent)' }}>
                          EDIT
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className='p-5 text-sm text-center' style={{ color: 'var(--tx3)' }}>No products yet</p>
                )}
              </div>
            </motion.div>

            {/* Recent Orders */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className='rounded-2xl overflow-hidden border'
              style={{ background: 'var(--card)', borderColor: 'var(--card-bdr)' }}
            >
              <div className='flex items-center justify-between px-5 py-3.5 border-b' style={{ borderColor: 'var(--card-bdr)' }}>
                <div className='flex items-center gap-2.5'>
                  <Radio size={13} style={{ color: 'var(--tx3)' }} strokeWidth={1.5} />
                  <span className='text-[10px] font-bold uppercase tracking-wider' style={{ color: 'var(--tx2)' }}>Signal Feed / Orders</span>
                </div>
                <Link href='/admin/orders' className='text-[10px] font-semibold font-mono' style={{ color: 'var(--accent)' }}>
                  VIEW ALL &rarr;
                </Link>
              </div>
              <div className='divide-y' style={{ borderColor: 'var(--card-bdr)' }}>
                {loadingOrders ? (
                  [...Array(4)].map((_, i) => (
                    <div key={i} className='flex items-center gap-3 p-3.5'>
                      <Skeleton className='w-9 h-9' />
                      <div className='flex-1 space-y-1'>
                        <Skeleton className='h-3.5 w-2/5' />
                        <Skeleton className='h-3 w-1/4' />
                      </div>
                      <Skeleton className='h-5 w-14 rounded-full' />
                    </div>
                  ))
                ) : recentOrders?.recentOrders?.length ? (
                  recentOrders.recentOrders.map((o: any) => (
                    <div key={o._id} className='flex items-center gap-3 p-3.5 transition-colors duration-150'
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <div className='w-9 h-9 rounded-lg flex items-center justify-center shrink-0' style={{ background: 'var(--surface)' }}>
                        <ShoppingBag size={14} style={{ color: 'var(--tx2)' }} strokeWidth={1.5} />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <p className='font-medium text-sm truncate' style={{ color: 'var(--tx)' }}>
                          {o.user?.name || 'Guest'} — {o.items?.[0]?.name || `Order #${o._id?.slice(-6) || ''}`}
                        </p>
                        <p className='text-xs flex items-center gap-1.5' style={{ color: 'var(--tx3)' }}>
                          {o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                          {' · '}{(o.items || []).reduce((n: number, i: any) => n + i.quantity, 0)} item(s)
                        </p>
                      </div>
                      <div className='text-right shrink-0'>
                        <p className='font-bold text-sm font-mono' style={{ color: 'var(--tx)' }}>{formatPrice(o.total || 0)}</p>
                        <span className='inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-semibold'
                          style={{
                            background: o.status === 'delivered' ? 'rgba(34,197,94,0.1)' : o.status === 'pending' ? 'rgba(245,158,11,0.1)' : 'rgba(99,102,241,0.1)',
                            color: o.status === 'delivered' ? '#22c55e' : o.status === 'pending' ? '#f59e0b' : '#6366f1',
                          }}>
                          <LedDot
                            color={o.status === 'delivered' ? '#22c55e' : o.status === 'pending' ? '#f59e0b' : '#6366f1'}
                            pulse={o.status !== 'delivered'}
                          />
                          {o.status || 'processing'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className='p-5 text-sm text-center' style={{ color: 'var(--tx3)' }}>No orders yet</p>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        <style>{`
          @keyframes led-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
          }
        `}</style>
      </div>
    </PageTransition>
  );
}
