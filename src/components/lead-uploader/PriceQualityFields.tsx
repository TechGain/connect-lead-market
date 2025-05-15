
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from "@/components/ui/input";

interface PriceQualityFieldsProps {
  price: string;
  onPriceChange: (value: string) => void;
}

const PriceQualityFields = ({
  price,
  onPriceChange,
}: PriceQualityFieldsProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="price">Asking Price ($) *</Label>
      <Input
        id="price"
        type="number"
        min="1"
        step="0.01"
        value={price}
        onChange={(e) => onPriceChange(e.target.value)}
        placeholder="49.99"
        required
      />
    </div>
  );
};

export default PriceQualityFields;
