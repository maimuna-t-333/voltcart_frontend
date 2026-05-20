'use client';
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { DollarSign } from 'lucide-react';
import api from '@/lib/axios';
import { formatPrice } from '@/lib/utils';


interface TrendPoint { date: string; revenue: number; orders: number }
interface ChartPoint { date: string; revenue: number; orders: number }

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className='bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3'>
      <p className='text-sm text-gray-500 mb-1'>{label}</p>
      <p className='text-lg font-bold text-gray-900'>{formatPrice(payload[0].value)}</p>
    </div>
  );
};

function ChartInner({ chartData }: { chartData: ChartPoint[] }) {
  const {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  } = require('recharts');

  return (
    <ResponsiveContainer width='100%' height={288}>
      <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id='revenueGradient' x1='0' y1='0' x2='0' y2='1'>
            <stop offset='0%' stopColor='#22c55e' stopOpacity={0.3} />
            <stop offset='100%' stopColor='#22c55e' stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray='3 3' stroke='#f1f5f9' />
        <XAxis dataKey='date' tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false}
          tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
        <Tooltip content={<CustomTooltip />} />
        <Area type='monotone' dataKey='revenue' stroke='#22c55e' strokeWidth={2} fill='url(#revenueGradient)' />
      </AreaChart>
    </ResponsiveContainer>
  );
}

const ClientChart = dynamic(() => Promise.resolve(ChartInner), { ssr: false });

export default function RevenueChart() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'revenue-trends'],
    queryFn: async () => {
      const { data } = await api.get('/admin/dashboard/revenue?period=day');
      return data.data;
    },
  });

  const chartData: ChartPoint[] = (data?.trends ?? []).map((t: TrendPoint) => ({
    date: new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    revenue: t.revenue,
    orders: t.orders,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className='bg-white border border-gray-100 rounded-2xl shadow-sm p-6'
    >
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center'>
            <DollarSign size={20} className='text-green-600' />
          </div>
          <div>
            <h2 className='font-bold text-gray-900'>Revenue Overview</h2>
            <p className='text-sm text-gray-500'>Last 30 days daily revenue</p>
          </div>
        </div>
      </div>

      <div className='h-72'>
        {isLoading ? (
          <div className='h-full flex items-center justify-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-green-500' />
          </div>
        ) : chartData.length === 0 ? (
          <div className='h-full flex items-center justify-center text-gray-400 text-sm'>
            No revenue data available yet
          </div>
        ) : (
          <ClientChart chartData={chartData} />
        )}
      </div>
    </motion.div>
  );
}