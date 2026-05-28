'use client';
import { motion } from 'framer-motion';

const steps = ['Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];

export function OrderTimeline({ currentStatus }: { currentStatus: string }) {
  const currentIdx = steps.indexOf(currentStatus);
  return (
    <div className='relative'>
      {steps.map((s, i) => {
        const done = i <= currentIdx;
        return (
          <div key={s} className='flex items-start gap-4 mb-6 relative'>
            {/* Connecting line */}
            {i < steps.length - 1 && (
              <div
                className='absolute left-[15px] top-8 w-0.5 h-8'
                style={{
                  background: done && i < currentIdx ? 'var(--accent)' : 'var(--border)',
                }}
              />
            )}
            <motion.div
              className='w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 relative z-10'
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.1 + 0.2, type: 'spring' as const, stiffness: 400 }}
              style={{
                background: done ? 'var(--accent)' : 'var(--surface)',
                color: done ? '#fff' : 'var(--tx3)',
                boxShadow: done ? '0 0 12px var(--accent-glow)' : 'none',
              }}
            >
              {i < currentIdx ? '✓' : i + 1}
            </motion.div>
            <motion.div
              className='pt-1'
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
            >
              <p className='font-medium' style={{ color: done ? 'var(--tx)' : 'var(--tx3)' }}>{s}</p>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
