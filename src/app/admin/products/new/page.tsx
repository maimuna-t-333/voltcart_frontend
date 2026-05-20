'use client';
import { useRequireAdmin } from '@/hooks/useAuth';
import PageTransition from '@/components/layout/PageTransition';
import ProductForm from '@/components/admin/ProductForm';

export default function NewProductPage() {
  const { user } = useRequireAdmin();
  if (!user || user.role !== 'admin') return null;

  return (
    <PageTransition>
      <ProductForm mode='create' />
    </PageTransition>
  );
}