'use client';
import { useState } from'react';
import { motion } from'framer-motion';
import { Star, Quote, BadgeCheck } from'lucide-react';

const reviews = [
 {
 name:'Alex Chen', handle:'@alexchen', gender:'m', num: 1,
 rating: 5, color:'#6366f1',
 text:'The MacBook Air M3 exceeded every expectation. Battery lasts me two full workdays. Insanely fast, stays cool even under heavy load.',
 },
 {
 name:'Sarah Mitchell', handle:'@sarahtech', gender:'f', num: 1,
 rating: 5, color:'#8b5cf6',
 text:'Best purchase I made this year. The display is gorgeous and the build quality is unmatched. Zero regrets switching from Windows.',
 },
 {
 name:'James Okonkwo', handle:'@jameso', gender:'m', num: 2,
 rating: 5, color:'#06b6d4',
 text:'Delivery was faster than expected and the product was well-packaged. Been using it daily for a month now — flawless performance.',
 },
 {
 name:'Priya Sharma', handle:'@priya_s', gender:'f', num: 2,
 rating: 4, color:'#f59e0b',
 text:'Great laptop overall. The M3 chip handles all my design work effortlessly. Only wish there were more port options, but the dongle works fine.',
 },
 {
 name:'Marcus Johnson', handle:'@marcusj', gender:'m', num: 3,
 rating: 5, color:'#ec4899',
 text:'Bought this for my son and he absolutely loves it. The speed is incredible and the battery life is a game-changer for his college classes.',
 },
 {
 name:'Emily Zhang', handle:'@emilyzhang', gender:'f', num: 3,
 rating: 5, color:'#14b8a6',
 text:'Switched from a 5-year-old laptop and the difference is night and day. Everything is smooth, the screen is stunning, and it&rsquo;s so lightweight.',
 },
 {
 name:'Daniel Park', handle:'@danielp', gender:'m', num: 4,
 rating: 4, color:'#f97316',
 text:'Solid machine for development work. The M3 handles Docker, multiple IDEs, and browsers without breaking a sweat. Highly recommend for devs.',
 },
 {
 name:'Olivia Martinez', handle:'@oliviam', gender:'f', num: 4,
 rating: 5, color:'#22c55e',
 text:'I&rsquo;ve had mine for three months now and it still feels brand new. The build quality is phenomenal and customer support was super helpful.',
 },
 {
 name:'Ryan Thompson', handle:'@ryanthompson', gender:'m', num: 5,
 rating: 5, color:'#e11d48',
 text:'The Retina display is absolutely beautiful. I edit photos on this and the color accuracy is spot-on. Best investment for my freelance work.',
 },
 {
 name:'Aisha Patel', handle:'@aishapatel', gender:'f', num: 5,
 rating: 4, color:'#7c3aed',
 text:'Great laptop for everyday use. Light, fast, and the keyboard is comfortable for long typing sessions. Battery easily lasts a full day.',
 },
 {
 name:'Chris Walker', handle:'@chrisw', gender:'m', num: 6,
 rating: 5, color:'#0ea5e9',
 text:'This is my third MacBook and by far the best. The M3 chip is a beast. Handles video editing like a champ and stays silent the whole time.',
 },
 {
 name:'Mia Kobayashi', handle:'@miakobayashi', gender:'f', num: 6,
 rating: 5, color:'#d946ef',
 text:'Worth every penny. The seamless ecosystem integration with my other devices makes work so much easier. Never going back to Windows.',
 },
];

const duplicated = [...reviews, ...reviews];

function ReviewCard({ review }: { review: typeof reviews[0] }) {
 return (
 <div
 className='group relative rounded-2xl border p-5 sm:p-6 flex flex-col w-[clamp(260px,75vw,360px)] transition-all duration-300 hover:-translate-y-1 shrink-0'
 style={{
 background:'var(--card)',
 borderColor:'var(--card-bdr)',
 }}
>
 {/* hover glow */}
 <div
 className='absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none'
 style={{
 background:`radial-gradient(ellipse at 50% 0%, ${review.color}15 0%, transparent 70%)`,
 }}
 />

 {/* decorative quote icon */}
 <Quote
 size={36}
 strokeWidth={1}
 className='absolute top-3 right-3 opacity-[0.06] text-neutral-900 pointer-events-none'
 />

 {/* top-right flourish */}
 <div
 className='absolute -top-4 -right-4 size-16 rounded-full opacity-[0.04] transition-all duration-500 group-hover:scale-[2] group-hover:opacity-[0.06] pointer-events-none'
 style={{
 background:`radial-gradient(circle, ${review.color}, transparent 70%)`,
 }}
 />

 {/* stars + badge */}
 <div className='flex items-center justify-between mb-3'>
 <div className='flex items-center gap-0.5'>
 {Array.from({ length: 5 }).map((_, j) => (
 <Star
 key={j}
 size={13}
 strokeWidth={1.5}
 className={j < review.rating ?'fill-amber-400 text-amber-400' :'text-neutral-300'}
 />
 ))}
 </div>
 <BadgeCheck size={13} strokeWidth={1.5} className='text-[#22c55e] shrink-0' />
 </div>

 {/* text */}
 <p className='text-[13px] leading-relaxed flex-1' style={{ color:'var(--tx)' }}>
 &ldquo;{review.text}&rdquo;
 </p>

 {/* author */}
 <div className='flex items-center gap-3 mt-4 pt-4' style={{ borderTop:'1px solid var(--border)' }}>
 <img
 src={`https://randomuser.me/api/portraits/${review.gender ==='m' ?'men' :'women'}/${review.num}.jpg`}
 alt={review.name}
 className='size-9 rounded-full shrink-0 object-cover'
 />
 <div className='flex-1 min-w-0'>
 <p className='text-[13px] font-semibold truncate' style={{ color:'var(--tx)' }}>
 {review.name}
 </p>
 <div className='flex items-center gap-1.5'>
 <p className='text-[11px]' style={{ color:'var(--tx2)' }}>
 {review.handle}
 </p>
 <span className='text-[9px] font-medium text-[#22c55e] shrink-0'>Verified</span>
 </div>
 </div>
 </div>
 </div>
 );
}

export default function ReviewSection() {
 const [isPaused, setIsPaused] = useState(false);

 return (
 <section className='relative overflow-hidden border-y border-neutral-100 transition-colors duration-400' style={{ background:'var(--bg)' } as React.CSSProperties}>
 <div className='absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[#6366f1]/35 to-transparent' />

 <div aria-hidden className='pointer-events-none absolute inset-0 z-0'>
 <div className='hb-grid-overlay absolute inset-0' />
 <div
 className='absolute rounded-full blur-[110px] w-[500px] h-[400px] -top-[150px] right-0'
 style={{ background:'var(--accent-glow)' }}
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
 <p className='text-[12.5px] font-semibold tracking-[0.2em] uppercase mb-3' style={{ color:'var(--accent)' }}>
 Testimonials
 </p>
 <h2 className='text-[26px] sm:text-[30px] font-bold tracking-tight' style={{ color:'var(--tx)' }}>
 What Our{''}
 <span className='text-transparent bg-clip-text bg-linear-to-r from-[#6366f1] to-[#8b5cf6]'>
 Customers Say
 </span>
 </h2>
 <p className='text-[13.5px] mt-2 max-w-md mx-auto' style={{ color:'var(--tx2)' }}>
 Real reviews from real customers who love their gear
 </p>
 </motion.div>

 {/* divider */}
 <div className='flex items-center gap-4 mt-8 sm:mt-10 mb-8 sm:mb-10'>
 <div className='flex-1 h-px bg-linear-to-r from-transparent via-[#6366f1]/20 to-transparent' />
 <div className='size-1.5 rounded-full' style={{ background:'var(--accent)' }} />
 <div className='flex-1 h-px bg-linear-to-r from-transparent via-[#6366f1]/20 to-transparent' />
 </div>

 {/* rating summary */}
 <div className='flex items-center justify-center gap-6 sm:gap-10 mb-8'>
 <div className='text-center'>
 <p className='text-[32px] sm:text-[38px] font-bold leading-none' style={{ color:'var(--tx)' }}>
 4.8
 </p>
 <div className='flex items-center justify-center gap-0.5 mt-1'>
 {Array.from({ length: 5 }).map((_, j) => (
 <Star key={j} size={11} strokeWidth={1.5} className='fill-amber-400 text-amber-400' />
 ))}
 </div>
 <p className='text-[11px] mt-1' style={{ color:'var(--tx2)' }}>Average rating</p>
 </div>
 <div className='w-px h-10' style={{ background:'var(--border)' }} />
 <div className='text-center'>
 <p className='text-[32px] sm:text-[38px] font-bold leading-none' style={{ color:'var(--tx)' }}>
 12
 </p>
 <p className='text-[11px] mt-1' style={{ color:'var(--tx2)' }}>Verified reviews</p>
 </div>
 </div>

 {/* auto-scroll shelf */}
 <div
 className='overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_3%,black_97%,transparent)]'
 onMouseEnter={() => setIsPaused(true)}
 onMouseLeave={() => setIsPaused(false)}
>
 <motion.div
 className='flex gap-4 sm:gap-5'
 animate={isPaused ? {} : { x:'-50%' }}
 transition={{
 duration: 15,
 ease:'linear',
 repeat: Infinity,
 repeatType:'loop',
 }}
>
 {duplicated.map((review, i) => (
 <ReviewCard key={`${review.name}-${i}`} review={review} />
 ))}
 </motion.div>
 </div>
 </div>
 </section>
 );
}
