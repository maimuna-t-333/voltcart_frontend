'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Review } from '@/types';
import StarRating from './StarRating';
import { formatDate } from '@/lib/utils';

interface ReviewListProps {
  reviews: Review[];
  isLoading: boolean;
}

export default function ReviewList({ reviews, isLoading }: ReviewListProps) {
  if (isLoading) {
    return (
      <div className='space-y-4'>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className='animate-pulse bg-gray-50 rounded-2xl p-5 space-y-2'>
            <div className='h-4 bg-gray-200 rounded w-1/3' />
            <div className='h-3 bg-gray-200 rounded w-1/4' />
            <div className='h-3 bg-gray-200 rounded w-full' />
            <div className='h-3 bg-gray-200 rounded w-2/3' />
          </div>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className='text-center py-12'>
        <p className='text-gray-400 text-lg mb-2'>No reviews yet</p>
        <p className='text-gray-400 text-sm'>Be the first to review this product</p>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <AnimatePresence>
        {reviews.map(review => (
          <motion.div
            key={review._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className='bg-gray-50 rounded-2xl p-5'
          >
            <div className='flex items-center justify-between mb-2'>
              <div className='flex items-center gap-3'>
                <div className='w-9 h-9 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-sm font-bold'>
                  {review.user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className='font-semibold text-gray-900 text-sm'>{review.user.name}</p>
                  <p className='text-xs text-gray-400'>{formatDate(review.createdAt)}</p>
                </div>
              </div>
              <StarRating rating={review.rating} />
            </div>
            {review.title && (
              <h4 className='font-semibold text-gray-800 text-sm mt-2'>{review.title}</h4>
            )}
            <p className='text-gray-600 text-sm mt-1 leading-relaxed'>{review.comment}</p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
