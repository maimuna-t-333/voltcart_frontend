'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useSubmitReview } from '@/hooks/useReviews';
import StarRating from './StarRating';
import toast from 'react-hot-toast';

interface ReviewFormProps {
  slug: string;
}

export default function ReviewForm({ slug }: ReviewFormProps) {
  const user = useAuthStore(s => s.user);
  const submit = useSubmitReview(slug);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');

  if (!user) {
    return (
      <div className='rounded-2xl p-6 text-center' style={{ background: 'var(--surface)' }}>
        <p className='text-sm' style={{ color: 'var(--tx3)' }}>
          Please <a href='/auth/login' style={{ color: 'var(--accent)', fontWeight: 600 }} className='hover:underline'>log in</a> to write a review
        </p>
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
        onError: (err) => {
          console.error('Review submit error:', err);
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
      className='rounded-2xl p-6 space-y-4'
      style={{ background: 'var(--surface)' }}
    >
      <h3 className='font-semibold' style={{ color: 'var(--tx)' }}>Write a Review</h3>

      <div>
        <label className='block text-sm font-medium mb-1.5' style={{ color: 'var(--tx2)' }}>Rating</label>
        <StarRating rating={rating} size={24} interactive onChange={setRating} />
      </div>

      <div>
        <label htmlFor='review-title' className='block text-sm font-medium mb-1.5' style={{ color: 'var(--tx2)' }}>Title (optional)</label>
        <input
          id='review-title'
          type='text'
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder='Summarize your review'
          className='w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-vc-accent focus:border-transparent'
          style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--tx)' }}
        />
      </div>

      <div>
        <label htmlFor='review-comment' className='block text-sm font-medium mb-1.5' style={{ color: 'var(--tx2)' }}>Comment</label>
        <textarea
          id='review-comment'
          rows={4}
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder='Share your experience with this product'
          className='w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-vc-accent focus:border-transparent resize-none'
          style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--tx)' }}
        />
      </div>

      <motion.button
        type='submit'
        disabled={submit.isPending}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className='text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all disabled:opacity-50'
        style={{
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          boxShadow: '0 4px 20px rgba(99,102,241,0.35), 0 0 40px rgba(99,102,241,0.1)',
        }}
      >
        {submit.isPending ? 'Submitting…' : 'Submit Review'}
      </motion.button>
    </motion.form>
  );
}
