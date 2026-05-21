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
            className={i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200 fill-gray-200'}
          />
        ))}
      </div>
    );
  }

  return (
    <div className='flex items-center gap-0.5'>
      {Array.from({ length: 5 }).map((_, i) => (
        <button key={i} type='button' onClick={() => onChange?.(i + 1)}
          className='transition-colors hover:scale-110'
        >
          <Star size={size}
            className={`cursor-pointer transition-colors ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 fill-gray-100 hover:fill-yellow-200 hover:text-yellow-300'}`}
          />
        </button>
      ))}
    </div>
  );
}
