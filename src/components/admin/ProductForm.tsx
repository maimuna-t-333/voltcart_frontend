'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import api from '@/lib/axios';

interface Variant {
  sku: string;
  color: string;
  storage: string;
  price: string;
  stock: string;
  images: string[];
}

interface Spec { key: string; value: string }

interface FormData {
  name: string;
  description: string;
  brand: string;
  category: string;
  subCategory: string;
  tags: string;
  basePrice: string;
  comparePrice: string;
  status: 'active' | 'draft' | 'archived';
  isFeatured: boolean;
  variants: Variant[];
  specs: Spec[];
}

interface ProductFormProps {
  mode: 'create' | 'edit';
  productId?: string;
  initial?: Partial<FormData>;
}

const CATEGORIES = ['Smartphones', 'Laptops', 'Tablets', 'Audio', 'Cameras', 'Accessories', 'Wearables', 'Gaming'];

const emptyVariant = (): Variant => ({ sku: '', color: '', storage: '', price: '', stock: '', images: [] });

function buildPayload(form: FormData) {
  return {
    name: form.name,
    description: form.description,
    brand: form.brand,
    category: form.category,
    subCategory: form.subCategory,
    tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    basePrice: Number(form.basePrice),
    comparePrice: form.comparePrice ? Number(form.comparePrice) : undefined,
    status: form.status,
    isFeatured: form.isFeatured,
    variants: form.variants.map(v => ({
      sku: v.sku,
      color: v.color,
      storage: v.storage,
      price: Number(v.price),
      stock: Number(v.stock),
      images: v.images,
    })),
    specs: form.specs.filter(s => s.key && s.value),
  };
}

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className='block text-sm font-medium text-gray-700 mb-1'>{label}</label>
    {children}
  </div>
);

const inputCls = 'w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm';

export default function ProductForm({ mode, productId, initial }: ProductFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [form, setForm] = useState<FormData>({
    name: initial?.name ?? '',
    description: initial?.description ?? '',
    brand: initial?.brand ?? '',
    category: initial?.category ?? '',
    subCategory: initial?.subCategory ?? '',
    tags: initial?.tags ?? '',
    basePrice: initial?.basePrice ?? '',
    comparePrice: initial?.comparePrice ?? '',
    status: initial?.status ?? 'draft',
    isFeatured: initial?.isFeatured ?? false,
    variants: initial?.variants?.length ? initial.variants : [emptyVariant()],
    specs: initial?.specs?.length ? initial.specs : [{ key: '', value: '' }],
  });

  const set = (field: keyof FormData, value: any) =>
    setForm(f => ({ ...f, [field]: value }));

  // variants
  const setVariant = (i: number, field: keyof Variant, value: string) =>
    setForm(f => {
      const variants = [...f.variants];
      variants[i] = { ...variants[i], [field]: value };
      return { ...f, variants };
    });
  const addVariant = () => setForm(f => ({ ...f, variants: [...f.variants, emptyVariant()] }));
  const removeVariant = (i: number) =>
    setForm(f => ({ ...f, variants: f.variants.filter((_, idx) => idx !== i) }));

  // specs
  const setSpec = (i: number, field: 'key' | 'value', value: string) =>
    setForm(f => {
      const specs = [...f.specs];
      specs[i] = { ...specs[i], [field]: value };
      return { ...f, specs };
    });
  const addSpec = () => setForm(f => ({ ...f, specs: [...f.specs, { key: '', value: '' }] }));
  const removeSpec = (i: number) =>
    setForm(f => ({ ...f, specs: f.specs.filter((_, idx) => idx !== i) }));

  // mutation
  const mutation = useMutation({
    mutationFn: (payload: object) =>
      mode === 'create'
        ? api.post('/products', payload)
        : api.patch(`/products/${productId}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      toast.success(mode === 'create' ? 'Product created!' : 'Product updated!');
      router.push('/admin/products');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Something went wrong');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.description || !form.brand || !form.category || !form.basePrice) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (form.variants.some(v => !v.sku || !v.price || !v.stock)) {
      toast.error('Each variant needs SKU, price, and stock');
      return;
    }
    mutation.mutate(buildPayload(form));
  };

  return (
    <div className='max-w-4xl mx-auto px-4 py-8'>
      {/* Header */}
      <div className='flex items-center gap-4 mb-8'>
        <Link href='/admin/products' className='text-gray-400 hover:text-gray-600'>
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>
            {mode === 'create' ? 'Add New Product' : 'Edit Product'}
          </h1>
          <p className='text-gray-500 text-sm mt-0.5'>
            {mode === 'create' ? 'Fill in the details to create a new product' : 'Update the product details below'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>

        {/* Basic Info */}
        <section className='bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-4'>
          <h2 className='font-semibold text-gray-900'>Basic Information</h2>

          <Field label='Product Name *'>
            <input className={inputCls} value={form.name} onChange={e => set('name', e.target.value)} placeholder='e.g. iPhone 15 Pro' />
          </Field>

          <Field label='Description *'>
            <textarea className={`${inputCls} resize-none`} rows={4} value={form.description}
              onChange={e => set('description', e.target.value)} placeholder='Describe the product...' />
          </Field>

          <div className='grid grid-cols-2 gap-4'>
            <Field label='Brand *'>
              <input className={inputCls} value={form.brand} onChange={e => set('brand', e.target.value)} placeholder='e.g. Apple' />
            </Field>
            <Field label='Category *'>
              <select className={inputCls} value={form.category} onChange={e => set('category', e.target.value)}>
                <option value=''>Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <Field label='Sub-category'>
              <input className={inputCls} value={form.subCategory} onChange={e => set('subCategory', e.target.value)} placeholder='e.g. Flagship' />
            </Field>
            <Field label='Tags (comma separated)'>
              <input className={inputCls} value={form.tags} onChange={e => set('tags', e.target.value)} placeholder='e.g. 5G, NFC, wireless' />
            </Field>
          </div>
        </section>

        {/* Pricing */}
        <section className='bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-4'>
          <h2 className='font-semibold text-gray-900'>Pricing</h2>
          <div className='grid grid-cols-2 gap-4'>
            <Field label='Base Price (USD) *'>
              <input className={inputCls} type='number' min='0' step='0.01' value={form.basePrice}
                onChange={e => set('basePrice', e.target.value)} placeholder='0.00' />
            </Field>
            <Field label='Compare Price (original / crossed out)'>
              <input className={inputCls} type='number' min='0' step='0.01' value={form.comparePrice}
                onChange={e => set('comparePrice', e.target.value)} placeholder='0.00' />
            </Field>
          </div>
        </section>

        {/* Variants */}
        <section className='bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-4'>
          <div className='flex items-center justify-between'>
            <h2 className='font-semibold text-gray-900'>Variants</h2>
            <button type='button' onClick={addVariant}
              className='flex items-center gap-1.5 text-sm text-brand-500 hover:text-brand-600 font-medium'>
              <Plus size={16} /> Add Variant
            </button>
          </div>

          {form.variants.map((v, i) => (
            <div key={i} className='border border-gray-100 rounded-xl p-4 space-y-3 relative'>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium text-gray-500'>Variant {i + 1}</span>
                {form.variants.length > 1 && (
                  <button type='button' onClick={() => removeVariant(i)} className='text-red-400 hover:text-red-500'>
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
              <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
                <Field label='SKU *'>
                  <input className={inputCls} value={v.sku} onChange={e => setVariant(i, 'sku', e.target.value)} placeholder='e.g. IPH15P-BLK-128' />
                </Field>
                <Field label='Color'>
                  <input className={inputCls} value={v.color} onChange={e => setVariant(i, 'color', e.target.value)} placeholder='e.g. Black' />
                </Field>
                <Field label='Storage'>
                  <input className={inputCls} value={v.storage} onChange={e => setVariant(i, 'storage', e.target.value)} placeholder='e.g. 128GB' />
                </Field>
              </div>
              <div className='grid grid-cols-2 gap-3'>
                <Field label='Price *'>
                  <input className={inputCls} type='number' min='0' step='0.01' value={v.price}
                    onChange={e => setVariant(i, 'price', e.target.value)} placeholder='0.00' />
                </Field>
                <Field label='Stock *'>
                  <input className={inputCls} type='number' min='0' value={v.stock}
                    onChange={e => setVariant(i, 'stock', e.target.value)} placeholder='0' />
                </Field>
              </div>
              <Field label='Image URLs (one per line)'>
                <textarea className={`${inputCls} resize-none`} rows={2}
                  value={v.images.join('\n')}
                  onChange={e => setVariant(i, 'images', e.target.value.split('\n').filter(Boolean) as any)}
                  placeholder='https://...' />
              </Field>
            </div>
          ))}
        </section>

        {/* Specs */}
        <section className='bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-4'>
          <div className='flex items-center justify-between'>
            <h2 className='font-semibold text-gray-900'>Specifications</h2>
            <button type='button' onClick={addSpec}
              className='flex items-center gap-1.5 text-sm text-brand-500 hover:text-brand-600 font-medium'>
              <Plus size={16} /> Add Spec
            </button>
          </div>
          {form.specs.map((s, i) => (
            <div key={i} className='flex gap-3 items-start'>
              <input className={`${inputCls} flex-1`} value={s.key}
                onChange={e => setSpec(i, 'key', e.target.value)} placeholder='e.g. Display' />
              <input className={`${inputCls} flex-1`} value={s.value}
                onChange={e => setSpec(i, 'value', e.target.value)} placeholder='e.g. 6.1" OLED' />
              <button type='button' onClick={() => removeSpec(i)} className='text-red-400 hover:text-red-500 mt-2'>
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </section>

        {/* Publishing */}
        <section className='bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-4'>
          <h2 className='font-semibold text-gray-900'>Publishing</h2>
          <div className='grid grid-cols-2 gap-4'>
            <Field label='Status'>
              <select className={inputCls} value={form.status} onChange={e => set('status', e.target.value as any)}>
                <option value='draft'>Draft</option>
                <option value='active'>Active</option>
                <option value='archived'>Archived</option>
              </select>
            </Field>
            <Field label='Featured'>
              <div className='flex items-center gap-3 mt-2'>
                <button type='button'
                  onClick={() => set('isFeatured', !form.isFeatured)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.isFeatured ? 'bg-brand-500' : 'bg-gray-200'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.isFeatured ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
                <span className='text-sm text-gray-600'>{form.isFeatured ? 'Featured on homepage' : 'Not featured'}</span>
              </div>
            </Field>
          </div>
        </section>

        {/* Submit */}
        <div className='flex items-center justify-end gap-3 pb-8'>
          <Link href='/admin/products'
            className='px-5 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 text-sm font-medium'>
            Cancel
          </Link>
          <button type='submit' disabled={mutation.isPending}
            className='flex items-center gap-2 bg-brand-500 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-brand-600 transition-colors disabled:opacity-60'>
            <Save size={16} />
            {mutation.isPending ? 'Saving...' : mode === 'create' ? 'Create Product' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}