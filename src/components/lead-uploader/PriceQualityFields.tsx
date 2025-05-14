
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from "@/components/ui/input";
import StarRating from '../StarRating';

interface PriceQualityFieldsProps {
  price: string;
  quality: number;
  onPriceChange: (value: string) => void;
  onQualityChange: (value: number) => void;
}

const PriceQualityFields = ({
  price,
  quality,
  onPriceChange,
  onQualityChange,
}: PriceQualityFieldsProps) => {
  // Enhanced handler that stops propagation
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation(); // Stop event propagation to prevent refreshes
    onPriceChange(e.target.value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="price">Asking Price ($) *</Label>
        <Input
          id="price"
          type="number"
          min="1"
          step="0.01"
          value={price}
          onChange={handlePriceChange}
          placeholder="49.99"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label>Lead Quality Rating</Label>
        <div className="pt-2">
          <StarRating 
            rating={quality} 
            onRatingChange={onQualityChange} 
            readOnly={false} 
            size={24} 
          />
        </div>
      </div>
    </div>
  );
};

export default PriceQualityFields;
