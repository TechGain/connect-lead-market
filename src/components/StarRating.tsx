
import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: number;
  onRatingChange?: (rating: number) => void;
  readOnly?: boolean;
}

const StarRating = ({ 
  rating, 
  maxStars = 5, 
  size = 20, 
  onRatingChange,
  readOnly = true
}: StarRatingProps) => {
  const handleClick = (index: number) => {
    if (readOnly || !onRatingChange) return;
    onRatingChange(index + 1);
  };

  return (
    <div className="flex">
      {Array.from({ length: maxStars }).map((_, index) => (
        <Star
          key={index}
          size={size}
          className={`${index < rating 
            ? 'text-yellow-400 fill-yellow-400' 
            : 'text-gray-300'} ${!readOnly ? 'cursor-pointer' : ''}`}
          onClick={() => handleClick(index)}
        />
      ))}
    </div>
  );
};

export default StarRating;
