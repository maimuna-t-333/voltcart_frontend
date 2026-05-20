'use client';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useRequireAdmin } from '@/hooks/useAuth';
import PageTransition from '@/components/layout/PageTransition';
import ProductForm from '@/components/admin/ProductForm';
import api from '@/lib/axios';

export default function EditProductPage() {
  const { user } = useRequireAdmin();
  const { id } = useParams<{ id: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data } = await api.get(`/products/id/${id}`);
      return data.data.product;
    },
    enabled: !!id,
  });

  if (!user || user.role !== 'admin') return null;

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500' />
      </div>
    );
  }

  if (!data) return <div className='p-8 text-center text-gray-400'>Product not found</div>;

  const initial = {
    name: data.name,
    description: data.description,
    brand: data.brand,
    category: data.category,
    subCategory: data.subCategory ?? '',
    tags: (data.tags ?? []).join(', '),
    basePrice: String(data.basePrice),
    comparePrice: data.comparePrice ? String(data.comparePrice) : '',
    status: data.status,
    isFeatured: data.isFeatured,
    variants: data.variants.map((v: any) => ({
      sku: v.sku,
      color: v.color ?? '',
      storage: v.storage ?? '',
      price: String(v.price),
      stock: String(v.stock),
      images: v.images ?? [],
    })),
    specs: data.specs?.length ? data.specs : [{ key: '', value: '' }],
  };

  return (
    <PageTransition>
      <ProductForm mode='edit' productId={id} initial={initial} />
    </PageTransition>
  );
}