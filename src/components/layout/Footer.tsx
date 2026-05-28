'use client';
import { motion } from'framer-motion';
import Link from'next/link';
import { Globe, MessageCircle, ExternalLink, ArrowUpRight } from'lucide-react';

const shopLinks = [
 { label:'Smartphones', href:'/products?category=Smartphones' },
 { label:'Laptops', href:'/products?category=Laptops' },
 { label:'Headphones', href:'/products?category=Headphones' },
 { label:'Tablets', href:'/products?category=Tablets' },
 { label:'Accessories', href:'/products?category=Accessories' },
];

const supportLinks = [
 { label:'Help Center', href:'#' },
 { label:'Track Order', href:'#' },
 { label:'Returns', href:'#' },
 { label:'Shipping Info', href:'#' },
 { label:'FAQ', href:'#' },
];

const companyLinks = [
 { label:'About Us', href:'#' },
 { label:'Affiliate Program', href:'#' },
 { label:'Privacy Policy', href:'#' },
 { label:'Terms of Service', href:'#' },
];

const socials = [
 { icon: Globe, href:'#', label:'Website' },
 { icon: MessageCircle, href:'#', label:'Community' },
 { icon: ExternalLink, href:'#', label:'Blog' },
];

export default function Footer() {
 return (
 <footer className='relative overflow-hidden border-t border-neutral-100 transition-colors duration-400' style={{ background:'var(--bg)' } as React.CSSProperties}>
 {/* gradient rule */}
 <div className='absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#6366f1]/35 to-transparent' />
 <div aria-hidden className='pointer-events-none absolute inset-0 z-0'>
 <div className='absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] rounded-full blur-[120px]' style={{ background:'var(--accent-glow)' }} />
 </div>

 <div className='relative z-10 mx-auto max-w-300 px-7 py-14 sm:py-16'>
 {/* grid */}
 <motion.div
 initial={{ opacity: 0, y: 16 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true }}
 transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
 className='grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 mb-10 sm:mb-12'
>
 {/* brand column */}
 <div className='col-span-2 md:col-span-1'>
 <Link href='/' className='inline-flex items-center gap-2 mb-4'>
 <img src='/VoltCart.png' alt='VoltCart' className='h-8 w-auto' />
 <span className='text-[18px] font-extrabold tracking-tight' style={{ color:'var(--tx)' }}>VoltCart</span>
 </Link>
 <p className='text-[13px] leading-relaxed text-neutral-400 max-w-[260px]'>
 Your one-stop shop for the latest gadgets and electronics. Quality products, unbeatable prices.
 </p>
 <div className='flex items-center gap-2.5 mt-6'>
 {socials.map((s) => (
 <a
 key={s.label}
 href={s.href}
 aria-label={s.label}
 className='flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100 text-neutral-400 transition-all duration-200 hover:bg-[#6366f1]/10 hover:text-[#6366f1] hover:scale-105'
>
 <s.icon size={15} strokeWidth={2} />
 </a>
 ))}
 </div>
 </div>

 {/* link columns */}
 {[
 { title:'Shop', links: shopLinks },
 { title:'Support', links: supportLinks },
 { title:'Company', links: companyLinks },
 ].map((col) => (
 <div key={col.title} className='col-span-2 md:col-span-1'>
 <h4 className='text-[13px] font-bold text-neutral-800 mb-4'>
 {col.title}
 </h4>
 <ul className='space-y-2.5'>
 {col.links.map((link) => (
 <li key={link.label}>
 <Link
 href={link.href}
 className='group inline-flex items-center gap-1 text-[13px] text-neutral-400 transition-colors duration-200 hover:text-[#6366f1]'
>
 {link.label}
 <ArrowUpRight
 size={11}
 strokeWidth={2}
 className='opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200'
 />
 </Link>
 </li>
 ))}
 </ul>
 </div>
 ))}
 </motion.div>

 {/* bottom bar */}
 <motion.div
 initial={{ opacity: 0 }}
 whileInView={{ opacity: 1 }}
 viewport={{ once: true }}
 transition={{ duration: 0.4, delay: 0.2 }}
 className='flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-neutral-100'
>
 <p className='text-[12px] text-neutral-400'>
 &copy; 2026 VoltCart. All rights reserved.
 </p>

 </motion.div>
 </div>
 </footer>
 );
}
