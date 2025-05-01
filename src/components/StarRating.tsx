
import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: number;
  onRatingChange?: (rating: number) => void;
  readOnly?: boolean;
  showValue?: boolean; // Add this prop
}

const StarRating = ({ 
  rating, 
  maxStars = 5, 
  size = 20, 
  onRatingChange,
  readOnly = true,
  showValue = false // Add default value
}: StarRatingProps) => {
  const handleClick = (index: number) => {
    if (readOnly || !onRatingChange) return;
    onRatingChange(index + 1);
  };

  return (
    <div className="flex items-center">
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
      {showValue && <span className="ml-2 text-sm">{rating} / {maxStars}</span>}
    </div>
  );
};

export default StarRating;
