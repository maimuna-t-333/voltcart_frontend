'use client';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  size?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export default function StarRating({ rating, size = 16, interactive = false, onChange }: StarRatingProps) {
  if (!interactive) {
    return (
      <div className='flex items-center gap-0.5'>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={size}
            style={{
              fill: i < Math.floor(rating) ? '#fbbf24' : 'var(--tx3)',
              color: i < Math.floor(rating) ? '#fbbf24' : 'var(--tx3)',
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className='flex items-center gap-0.5' style={{ color: 'var(--tx3)' }}>
      <style>{`
        .star-btn { color: inherit; }
        .star-btn:hover { color: #fbbf24; }
        .star-btn--active { color: #fbbf24 !important; }
      `}</style>
      {Array.from({ length: 5 }).map((_, i) => (
        <button key={i} type='button' onClick={() => onChange?.(i + 1)}
          className={`star-btn hover:scale-110 transition-all ${i < rating ? 'star-btn--active' : ''}`}
        >
          <Star size={size} className='cursor-pointer' style={{ fill: 'currentColor' }} />
        </button>
      ))}
    </div>
  );
}
