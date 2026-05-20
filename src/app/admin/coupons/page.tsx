'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, ToggleLeft, ToggleRight, Tag, X } from 'lucide-react';
import toast from 'react-hot-toast';
import PageTransition from '@/components/layout/PageTransition';
import { useRequireAdmin } from '@/hooks/useAuth';
import api from '@/lib/axios';

interface Coupon {
  _id: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  minOrder: number;
  maxUses: number | null;
  usesCount: number;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

interface CouponForm {
  code: string;
  type: 'percent' | 'fixed';
  value: string;
  minOrder: string;
  maxUses: string;
  expiresAt: string;
  isActive: boolean;
}

const empty: CouponForm = { code: '', type: 'percent', value: '', minOrder: '', maxUses: '', expiresAt: '', isActive: true };
const inputCls = 'w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm';

export default function AdminCouponsPage() {
  const { user } = useRequireAdmin();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CouponForm>(empty);

  const set = (field: keyof CouponForm, value: any) =>
    setForm(f => ({ ...f, [field]: value }));

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'coupons'],
    queryFn: async () => {
      const { data } = await api.get('/coupons');
      return data.data;
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: (payload: object) => api.post('/coupons', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
      toast.success('Coupon created!');
      setForm(empty);
      setShowForm(false);
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to create coupon'),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.patch(`/coupons/${id}`, { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] }),
    onError: () => toast.error('Failed to update coupon'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/coupons/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
      toast.success('Coupon deleted');
    },
    onError: () => toast.error('Failed to delete coupon'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code || !form.value) { toast.error('Code and value are required'); return; }
    createMutation.mutate({
      code: form.code.toUpperCase(),
      type: form.type,
      value: Number(form.value),
      minOrder: form.minOrder ? Number(form.minOrder) : 0,
      maxUses: form.maxUses ? Number(form.maxUses) : null,
      expiresAt: form.expiresAt || null,
      isActive: form.isActive,
    });
  };

  const handleDelete = (id: string, code: string) => {
    if (confirm(`Delete coupon "${code}"?`)) deleteMutation.mutate(id);
  };

  if (!user || user.role !== 'admin') return null;

  const coupons: Coupon[] = data?.coupons ?? [];
  const active = coupons.filter(c => c.isActive).length;

  return (
    <PageTransition>
      <div className='max-w-5xl mx-auto px-4 py-8'>

        {/* Header */}
        <div className='flex items-center justify-between mb-8'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>Coupons</h1>
            <p className='text-gray-500 mt-1'>{coupons.length} total · {active} active</p>
          </div>
          <button onClick={() => setShowForm(s => !s)}
            className='flex items-center gap-2 bg-brand-500 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-600 transition-colors'>
            {showForm ? <X size={18} /> : <Plus size={18} />}
            {showForm ? 'Cancel' : 'New Coupon'}
          </button>
        </div>

        {/* Create form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className='overflow-hidden mb-6'>
              <form onSubmit={handleSubmit}
                className='bg-white border border-brand-100 rounded-2xl shadow-sm p-6 space-y-4'>
                <h2 className='font-semibold text-gray-900'>Create New Coupon</h2>

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Code *</label>
                    <input className={inputCls} value={form.code}
                      onChange={e => set('code', e.target.value.toUpperCase())}
                      placeholder='e.g. SAVE20' />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Type *</label>
                    <select className={inputCls} value={form.type} onChange={e => set('type', e.target.value)}>
                      <option value='percent'>Percentage (%)</option>
                      <option value='fixed'>Fixed Amount ($)</option>
                    </select>
                  </div>
                </div>

                <div className='grid grid-cols-3 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Value * {form.type === 'percent' ? '(%)' : '($)'}
                    </label>
                    <input className={inputCls} type='number' min='0' step='0.01'
                      value={form.value} onChange={e => set('value', e.target.value)} placeholder='0' />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Min Order ($)</label>
                    <input className={inputCls} type='number' min='0' step='0.01'
                      value={form.minOrder} onChange={e => set('minOrder', e.target.value)} placeholder='0' />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Max Uses</label>
                    <input className={inputCls} type='number' min='1'
                      value={form.maxUses} onChange={e => set('maxUses', e.target.value)} placeholder='Unlimited' />
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Expires At</label>
                    <input className={inputCls} type='datetime-local'
                      value={form.expiresAt} onChange={e => set('expiresAt', e.target.value)} />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Status</label>
                    <div className='flex items-center gap-3 mt-2'>
                      <button type='button' onClick={() => set('isActive', !form.isActive)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.isActive ? 'bg-brand-500' : 'bg-gray-200'}`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                      <span className='text-sm text-gray-600'>{form.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                  </div>
                </div>

                <div className='flex justify-end gap-3 pt-2'>
                  <button type='button' onClick={() => { setForm(empty); setShowForm(false); }}
                    className='px-5 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 text-sm font-medium'>
                    Cancel
                  </button>
                  <button type='submit' disabled={createMutation.isPending}
                    className='px-6 py-2.5 bg-brand-500 text-white font-semibold rounded-xl hover:bg-brand-600 transition-colors disabled:opacity-60 text-sm'>
                    {createMutation.isPending ? 'Creating...' : 'Create Coupon'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Coupons list */}
        <div className='bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden'>
          <div className='grid grid-cols-12 gap-4 p-4 bg-gray-50 text-xs font-semibold text-gray-500 border-b border-gray-100 uppercase tracking-wide'>
            <div className='col-span-2'>Code</div>
            <div className='col-span-2'>Discount</div>
            <div className='col-span-2'>Min Order</div>
            <div className='col-span-2'>Uses</div>
            <div className='col-span-2'>Expires</div>
            <div className='col-span-1'>Status</div>
            <div className='col-span-1'></div>
          </div>

          {isLoading ? (
            <div className='p-12 text-center text-gray-400'>Loading coupons...</div>
          ) : coupons.length === 0 ? (
            <div className='p-12 text-center'>
              <Tag size={36} className='text-gray-200 mx-auto mb-3' />
              <p className='text-gray-400'>No coupons yet. Create your first one!</p>
            </div>
          ) : (
            <div className='divide-y divide-gray-50'>
              {coupons.map((coupon, i) => {
                const expired = coupon.expiresAt && new Date() > new Date(coupon.expiresAt);
                const exhausted = coupon.maxUses && coupon.usesCount >= coupon.maxUses;
                return (
                  <motion.div key={coupon._id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className='grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50 transition-colors'>
                    <div className='col-span-2'>
                      <span className='font-mono font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded-lg text-sm'>
                        {coupon.code}
                      </span>
                    </div>
                    <div className='col-span-2 text-sm font-medium text-gray-900'>
                      {coupon.type === 'percent' ? `${coupon.value}%` : `$${coupon.value}`} off
                    </div>
                    <div className='col-span-2 text-sm text-gray-500'>
                      {coupon.minOrder > 0 ? `$${coupon.minOrder}` : '—'}
                    </div>
                    <div className='col-span-2 text-sm text-gray-500'>
                      {coupon.usesCount}{coupon.maxUses ? ` / ${coupon.maxUses}` : ''}
                      {exhausted && <span className='ml-1 text-xs text-red-400'>(limit reached)</span>}
                    </div>
                    <div className='col-span-2 text-sm text-gray-500'>
                      {coupon.expiresAt
                        ? <span className={expired ? 'text-red-400' : ''}>
                            {new Date(coupon.expiresAt).toLocaleDateString()}
                          </span>
                        : '—'}
                    </div>
                    <div className='col-span-1'>
                      <button onClick={() => toggleMutation.mutate({ id: coupon._id, isActive: !coupon.isActive })}
                        className='transition-colors'>
                        {coupon.isActive
                          ? <ToggleRight size={24} className='text-brand-500' />
                          : <ToggleLeft size={24} className='text-gray-300' />}
                      </button>
                    </div>
                    <div className='col-span-1 flex justify-end'>
                      <button onClick={() => handleDelete(coupon._id, coupon.code)}
                        className='text-red-400 hover:text-red-500 transition-colors'>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}