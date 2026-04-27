import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Product } from '@/types';

interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  pages: number;
}

interface UseProductsOptions {
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  limit?: number;
}

export function useProducts(options: UseProductsOptions = {}) {
  return useQuery<ProductsResponse>({
    queryKey: ['products', options],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (options.search)   params.set('search', options.search);
      if (options.category) params.set('category', options.category);
      if (options.brand)    params.set('brand', options.brand);
      if (options.minPrice) params.set('minPrice', String(options.minPrice));
      if (options.maxPrice) params.set('maxPrice', String(options.maxPrice));
      if (options.sort)     params.set('sort', options.sort);
      if (options.page)     params.set('page', String(options.page));
      if (options.limit)    params.set('limit', String(options.limit));
      const { data } = await api.get(`/products?${params}`);
      return data.data;
    },
  });
}

export function useFeaturedProducts() {
  return useQuery<Product[]>({
    queryKey: ['products', 'featured'],
    queryFn: async () => {
      const { data } = await api.get('/products/featured');
      return data.data.products;
    },
  });
}
