'use client';
import { motion } from 'framer-motion';
import { type LucideIcon } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  change?: string;
  isLoading?: boolean;
}

export default function KpiCard({ label, value, icon: Icon, color, change, isLoading }: KpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br ${color} rounded-2xl p-5 text-white`}
    >
      <div className='flex items-center justify-between mb-3'>
        <Icon size={24} className='opacity-80' />
        {change && (
          <span className='text-xs bg-white/20 px-2 py-1 rounded-full flex items-center gap-1'>
            {change}
          </span>
        )}
      </div>
      {isLoading ? (
        <div className='space-y-2'>
          <div className='h-7 w-24 bg-white/20 rounded animate-pulse' />
          <div className='h-4 w-20 bg-white/20 rounded animate-pulse' />
        </div>
      ) : (
        <>
          <p className='text-2xl font-bold'>{value}</p>
          <p className='text-white/80 text-sm mt-1'>{label}</p>
        </>
      )}
    </motion.div>
  );
}
