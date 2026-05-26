'use client';
import { motion } from 'framer-motion';
import { Truck, RotateCcw, Shield, Headphones } from 'lucide-react';

const perks = [
  {
    icon: Truck, title: 'Free Shipping', desc: 'On orders over $50', num: '01',
    accent: '#6366f1',
    iconBg: 'bg-[#eef2ff] dark:bg-[#6366f1]/[0.12]',
    iconRing: 'ring-[#c7d2fe]/60 dark:ring-[#6366f1]/30',
    iconHoverBg: 'group-hover:bg-[#e0e7ff] dark:group-hover:bg-[#6366f1]/[0.22]',
    iconHoverRing: 'group-hover:ring-[#6366f1]/50 dark:group-hover:ring-[#818cf8]/50',
    iconColor: 'text-[#4f46e5] dark:text-[#818cf8]',
    textColor: 'group-hover:text-[#4f46e5] dark:group-hover:text-[#a5b4fc]',
  },
  {
    icon: RotateCcw, title: '30-Day Returns', desc: 'Hassle-free returns', num: '02',
    accent: '#06b6d4',
    iconBg: 'bg-[#ecfeff] dark:bg-[#06b6d4]/[0.12]',
    iconRing: 'ring-[#a5f3fc]/60 dark:ring-[#06b6d4]/30',
    iconHoverBg: 'group-hover:bg-[#cffafe] dark:group-hover:bg-[#06b6d4]/[0.22]',
    iconHoverRing: 'group-hover:ring-[#06b6d4]/50 dark:group-hover:ring-[#22d3ee]/50',
    iconColor: 'text-[#0891b2] dark:text-[#22d3ee]',
    textColor: 'group-hover:text-[#0891b2] dark:group-hover:text-[#22d3ee]',
  },
  {
    icon: Shield, title: '2-Year Warranty', desc: 'On all electronics', num: '03',
    accent: '#10b981',
    iconBg: 'bg-[#ecfdf5] dark:bg-[#10b981]/[0.12]',
    iconRing: 'ring-[#a7f3d0]/60 dark:ring-[#10b981]/30',
    iconHoverBg: 'group-hover:bg-[#d1fae5] dark:group-hover:bg-[#10b981]/[0.22]',
    iconHoverRing: 'group-hover:ring-[#10b981]/50 dark:group-hover:ring-[#34d399]/50',
    iconColor: 'text-[#059669] dark:text-[#34d399]',
    textColor: 'group-hover:text-[#059669] dark:group-hover:text-[#34d399]',
  },
  {
    icon: Headphones, title: '24/7 Support', desc: 'AI-powered chat', num: '04',
    accent: '#f59e0b',
    iconBg: 'bg-[#fffbeb] dark:bg-[#f59e0b]/[0.12]',
    iconRing: 'ring-[#fde68a]/60 dark:ring-[#f59e0b]/30',
    iconHoverBg: 'group-hover:bg-[#fef3c7] dark:group-hover:bg-[#f59e0b]/[0.22]',
    iconHoverRing: 'group-hover:ring-[#f59e0b]/50 dark:group-hover:ring-[#fbbf24]/50',
    iconColor: 'text-[#b45309] dark:text-[#fbbf24]',
    textColor: 'group-hover:text-[#b45309] dark:group-hover:text-[#fbbf24]',
  },
];

const iconAnimations = [
  { y: [0, -3, 0] },
  { rotate: [0, -15, 0] },
  { scale: [1, 1.06, 1] },
  { y: [0, -3, 0] },
];

export default function PromoBanner() {
  return (
    <section className='relative overflow-hidden border-y border-neutral-100 dark:border-white/6 bg-[#f2f2f8] dark:bg-[#08080e] transition-colors duration-400'>
      <div className='absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-vc-accent/35 to-transparent' />

      <div className='relative z-10 mx-auto `max-w-300`'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'>
          {perks.map((perk, i) => {
            const Icon = perk.icon;
            const floatAnim = iconAnimations[i];
            return (
              <motion.div
                key={perk.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className='group relative flex items-center gap-4 px-7 py-9 transition-colors duration-200 border-b sm:border-b-0 border-neutral-100 dark:border-white/6 hover:[background:color-mix(in_srgb,var(--perk-accent,#6366f1)_4%,transparent)] dark:hover:[background:color-mix(in_srgb,var(--perk-accent,#6366f1)_8%,transparent)] motion-reduce:transition-none'
                style={{
                  '--perk-accent': perk.accent,
                } as React.CSSProperties}
              >
                {/* right border (desktop) */}
                {i < 3 && (
                  <div className='absolute right-0 top-0 bottom-0 w-px bg-neutral-100 dark:bg-white/6 hidden lg:block' />
                )}

                {/* Index watermark */}
                <span className='
                  pointer-events-none absolute right-5 top-4
                  font-mono text-[10px] font-semibold tracking-[0.2em]
                  text-neutral-200 dark:text-white/[0.07]
                  transition-opacity duration-200 group-hover:opacity-0
                '>
                  {perk.num}
                </span>

                {/* Icon box */}
                <div className='relative shrink-0'>
                  <div
                    className='absolute -inset-1 rounded-2xl blur-md transition-all duration-300 group-hover:[background:color-mix(in_srgb,var(--perk-accent,#6366f1)_18%,transparent)]'
                  />
                  <div className={`
                    relative flex h-14 w-14 items-center justify-center rounded-2xl
                    ${perk.iconBg} ring-1 ${perk.iconRing}
                    transition-all duration-200 ${perk.iconHoverBg} ${perk.iconHoverRing}
                  `}>
                    <motion.div
                      animate={floatAnim}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <Icon
                        size={22}
                        strokeWidth={1.8}
                        className={`${perk.iconColor} transition-transform duration-300 group-hover:scale-110`}
                      />
                    </motion.div>
                  </div>
                </div>

                {/* Text */}
                <div className='flex flex-col `gap-1`'>
                  <div className='flex items-center gap-2'>
                    <p className={`
                      text-[14px] font-bold leading-tight
                      text-neutral-800 dark:text-white/85
                      transition-colors duration-200 ${perk.textColor}
                    `}>
                      {perk.title}
                    </p>
                    {/* Live indicator — only on support */}
                    {i === 3 && (
                      <span className='flex items-center gap-1 text-[10px] font-medium text-[#10b981]'>
                        <span className='relative flex h-2 w-2'>
                          <span className='absolute inset-0 rounded-full bg-[#10b981] animate-ping opacity-60' />
                          <span className='relative rounded-full bg-[#10b981] h-2 w-2' />
                        </span>
                        Online
                      </span>
                    )}
                  </div>
                  <p className='text-[12.5px] leading-snug text-neutral-400 dark:text-white/35'>
                    {perk.desc}
                  </p>
                </div>

                {/* Bottom sliding accent bar */}
                <div
                  className='absolute bottom-0 left-0 `h-0.5` rounded-full w-0 group-hover:w-full transition-[width] duration-300 ease-out'
                  style={{ background: `linear-gradient(90deg, ${perk.accent}, ${perk.accent}cc)` }}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
