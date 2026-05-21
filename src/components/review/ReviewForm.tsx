'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useSubmitReview } from '@/hooks/useReviews';
import StarRating from './StarRating';
import toast from 'react-hot-toast';

interface ReviewFormProps {
  productId: string;
}

export default function ReviewForm({ productId }: ReviewFormProps) {
  const user = useAuthStore(s => s.user);
  const submit = useSubmitReview(productId);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');

  if (!user) {
    return (
      <div className='bg-gray-50 rounded-2xl p-6 text-center'>
        <p className='text-gray-500 text-sm'>Please <a href='/auth/login' className='text-brand-500 font-semibold hover:underline'>log in</a> to write a review</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    if (!comment.trim()) {
      toast.error('Please write a comment');
      return;
    }

    submit.mutate(
      { rating, title: title.trim(), comment: comment.trim() },
      {
        onSuccess: () => {
          toast.success('Review submitted!');
          setRating(0);
          setTitle('');
          setComment('');
        },
        onError: () => {
          toast.error('Failed to submit review');
        },
      }
    );
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className='bg-gray-50 rounded-2xl p-6 space-y-4'
    >
      <h3 className='font-semibold text-gray-900'>Write a Review</h3>

      <div>
        <label className='block text-sm font-medium text-gray-700 mb-1.5'>Rating</label>
        <StarRating rating={rating} size={24} interactive onChange={setRating} />
      </div>

      <div>
        <label htmlFor='review-title' className='block text-sm font-medium text-gray-700 mb-1.5'>Title (optional)</label>
        <input
          id='review-title'
          type='text'
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder='Summarize your review'
          className='w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent'
        />
      </div>

      <div>
        <label htmlFor='review-comment' className='block text-sm font-medium text-gray-700 mb-1.5'>Comment</label>
        <textarea
          id='review-comment'
          rows={4}
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder='Share your experience with this product'
          className='w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none'
        />
      </div>

      <motion.button
        type='submit'
        disabled={submit.isPending}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className='bg-brand-500 hover:bg-brand-600 disabled:bg-gray-300 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors'
      >
        {submit.isPending ? 'Submitting…' : 'Submit Review'}
      </motion.button>
    </motion.form>
  );
}
