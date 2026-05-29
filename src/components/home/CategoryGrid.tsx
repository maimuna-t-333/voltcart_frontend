'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Smartphone, Laptop, Headphones, Tablet, Watch, Gamepad2, Mouse, Home, ArrowUpRight } from 'lucide-react';

type Category = {
    name: string;
    icon: typeof Smartphone;
    slug: string;
    desc: string;
    color1: string;
    color2: string;
};

const categories: Category[] = [
    { name: 'Smartphones', icon: Smartphone, slug: 'Smartphones', desc: 'Flagships & budget picks', color1: '#6366f1', color2: '#8b5cf6' },
    { name: 'Laptops', icon: Laptop, slug: 'Laptops', desc: 'Ultrabooks & gaming rigs', color1: '#8b5cf6', color2: '#a855f7' },
    { name: 'Headphones', icon: Headphones, slug: 'Headphones', desc: 'Wireless & studio sound', color1: '#a855f7', color2: '#d946ef' },
    { name: 'Tablets', icon: Tablet, slug: 'Tablets', desc: 'Work & entertainment', color1: '#06b6d4', color2: '#0891b2' },
    { name: 'Wearables', icon: Watch, slug: 'Wearables', desc: 'Smartwatches & trackers', color1: '#d97706', color2: '#f59e0b' },
    { name: 'Gaming', icon: Gamepad2, slug: 'Gaming', desc: 'Consoles & accessories', color1: '#dc2626', color2: '#ef4444' },
    { name: 'Accessories', icon: Mouse, slug: 'Accessories', desc: 'Cables, cases & more', color1: '#059669', color2: '#10b981' },
    { name: 'Smart Home', icon: Home, slug: 'Smart Home', desc: 'Automate your space', color1: '#2563eb', color2: '#3b82f6' },
];

export default function CategoryGrid() {
    return (
        <section className='relative overflow-hidden border-y border-neutral-100 transition-colors duration-400' style={{ background: 'var(--bg)' } as React.CSSProperties}>
            <div className='absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-accent-vc/35 to-transparent' />

            {/* bg glow — same as hero banner */}
            <div aria-hidden className='pointer-events-none absolute inset-0 z-0'>
                <div className='hb-grid-overlay absolute inset-0' />
                <div
                    className='absolute rounded-full blur-[110px] w-[700px] h-[600px] -top-[200px] -left-[200px]'
                    style={{ background: 'var(--accent-glow)' }}
                />
                <div
                    className='absolute rounded-full blur-[110px] w-[500px] h-[500px] -bottom-[100px] right-0'
                    style={{ background: 'rgba(139,92,246,0.12)' }}
                />
            </div>

            <div className='relative z-10 mx-auto max-w-300 px-7 py-16 sm:py-20'>
                {/* heading */}
                <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    className='text-center'
                >
                    <p className='text-[12.5px] font-semibold tracking-[0.2em] uppercase text-vc-accent mb-3'>
                        Categories
                    </p>
                    <h2 className='text-[26px] sm:text-[30px] font-bold tracking-tight text-neutral-900'>
                        Shop by <span style={{ color: 'var(--accent)' }}>Category</span>
                    </h2>
                    <p className='text-[13.5px] text-neutral-500 mt-2 max-w-md mx-auto'>
                        Find exactly what you&rsquo;re looking for
                    </p>
                </motion.div>

                {/* decorative divider */}
                <div className='flex items-center gap-4 mt-8 sm:mt-10 mb-8 sm:mb-10'>
                    <div className='flex-1 h-px bg-linear-to-r from-transparent via-vcaccent/20 to-transparent' />
                    <div className='size-1.5 rounded-full bg-vc-accent/30' />
                    <div className='flex-1 h-px bg-linear-to-r from-transparent via-vcaccent/20 to-transparent' />
                </div>

                {/* grid */}
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5'>
                    {categories.map((cat, i) => {
                        const Icon = cat.icon;
                        const fromLeft = i % 2 === 0;

                        return (
                            <motion.div
                                key={cat.name}
                                initial={{ opacity: 0, y: 30, x: fromLeft ? -18 : 18 }}
                                whileInView={{ opacity: 1, y: 0, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.07, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                                className='group'
                            >
                                <Link href={`/products?category=${cat.slug}`}>
                                    <motion.div
                                        whileHover={{ y: -4 }}
                                        whileTap={{ scale: 0.98 }}
                                        className='relative h-full rounded-2xl border border-neutral-100 bg-white overflow-hidden transition-shadow duration-300 motion-reduce:transition-none hover:[box-shadow:0_8px_40px_color-mix(in_srgb,var(--c1)_10%,transparent),inset_0_0_0_1px_color-mix(in_srgb,var(--c1)_18%,transparent)] motion-reduce:hover:[box-shadow:none]!'
                                        style={{ '--c1': cat.color1, '--c2': cat.color2 } as React.CSSProperties}
                                    >
                                        {/* dot-matrix texture */}
                                        <div
                                            className='absolute inset-0 opacity-[0.015] pointer-events-none'
                                            style={{
                                                backgroundImage: 'radial-gradient(circle, currentColor 0.5px, transparent 0.5px)',
                                                backgroundSize: '16px 16px',
                                                color: 'var(--c1)',
                                            }}
                                        />

                                        {/* accent bar */}
                                        <div
                                            className='absolute left-0 top-3 bottom-3 w-1.5 rounded-r-full transition-all duration-300 group-hover:top-0 group-hover:bottom-0 motion-reduce:transition-none motion-reduce:top-3 motion-reduce:bottom-3'
                                            style={{
                                                background: `linear-gradient(to bottom, var(--c1), var(--c2))`,
                                            }}
                                        />

                                        {/* bg wash */}
                                        <div
                                            className='absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 motion-reduce:transition-none motion-reduce:opacity-100'
                                            style={{
                                                background: `color-mix(in srgb, var(--c1) 6%, transparent)`,
                                            }}
                                        />

                                        {/* content */}
                                        <div className='relative p-5 sm:p-6 pl-7 sm:pl-8 flex flex-col h-full min-h-45'>
                                            <div
                                                className='mb-4 size-11 rounded-xl flex items-center justify-center shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg motion-reduce:transition-none motion-reduce:scale-100'
                                                style={{
                                                    background: `linear-gradient(135deg, var(--c1), var(--c2))`,
                                                }}
                                            >
                                                <Icon size={20} strokeWidth={1.8} className='text-white' />
                                            </div>

                                            <div className='flex-1'>
                                                <h3 className='text-[15px] font-bold text-neutral-800 transition-colors duration-200 group-hover:text-(--c1) motion-reduce:transition-none'>
                                                    {cat.name}
                                                </h3>
                                                <p className='text-[12.5px] text-neutral-400 mt-1.5 leading-relaxed line-clamp-2'>
                                                    {cat.desc}
                                                </p>
                                            </div>

                                            <div
                                                className='mt-3 pt-1 flex items-center gap-1 text-[12px] font-semibold opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-x-0'
                                                style={{ color: 'var(--c1)' }}
                                            >
                                                Explore
                                                <ArrowUpRight size={12} strokeWidth={2.5} />
                                            </div>
                                        </div>

                                        {/* bottom sweep bar */}
                                        <div
                                            className='absolute bottom-0 left-0 h-0.5 rounded-full w-0 group-hover:w-full transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none motion-reduce:w-full'
                                            style={{
                                                background: `linear-gradient(90deg, var(--c1), var(--c2))`,
                                            }}
                                        />

                                        {/* bottom-right flourish */}
                                        <div
                                            className='absolute -bottom-4 -right-4 size-16 rounded-full opacity-[0.04] transition-all duration-500 group-hover:scale-[2] group-hover:opacity-[0.06] motion-reduce:transition-none motion-reduce:scale-100 motion-reduce:opacity-[0.04] pointer-events-none'
                                            style={{
                                                background: `radial-gradient(circle, var(--c1), transparent 70%)`,
                                            }}
                                        />
                                    </motion.div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
