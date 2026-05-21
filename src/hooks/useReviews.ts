import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Review } from '@/types';

export function useReviews(slug: string) {
  return useQuery<Review[]>({
    queryKey: ['reviews', slug],
    queryFn: async () => {
      const { data } = await api.get(`/products/${slug}/reviews`);
      return data.data.reviews.map((r: any) => ({ ...r, comment: r.body }));
    },
    enabled: !!slug,
  });
}

export function useSubmitReview(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: { rating: number; title: string; comment: string }) => {
      const { data } = await api.post(`/products/${slug}/reviews`, body);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', slug] });
    },
  });
}
