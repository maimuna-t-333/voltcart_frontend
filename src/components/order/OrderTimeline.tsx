'use client';
import { motion } from 'framer-motion';

const steps = ['Confirmed','Processing','Shipped','Out for Delivery','Delivered'];

export function OrderTimeline({ currentStatus }: { currentStatus: string }) {
  const currentIdx = steps.indexOf(currentStatus);
  return (
    <div className='relative'>
      {steps.map((s, i) => (
        <motion.div key={s}
          className='flex items-start gap-4 mb-6'
          initial={{ opacity:0, x:-20 }}
          animate={{ opacity:1, x:0 }}
          transition={{ delay: i * 0.1, duration: 0.4 }}
        >
          <motion.div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${i<=currentIdx?'bg-brand-500 text-white':'bg-gray-200 text-gray-400'}`}
            initial={{ scale:0 }}
            animate={{ scale:1 }}
            transition={{ delay: i*0.1+0.2, type:'spring', stiffness:400 }}
          >
            {i < currentIdx ? '✓' : i+1}
          </motion.div>
          <div>
            <p className={`font-medium ${i<=currentIdx?'text-gray-900':'text-gray-400'}`}>{s}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
