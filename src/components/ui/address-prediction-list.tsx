
import React from 'react';
import { Prediction } from '@/hooks/use-places-autocomplete';

interface AddressPredictionListProps {
  predictions: Prediction[];
  onSelectPrediction: (prediction: Prediction) => void;
  show: boolean;
}

export function AddressPredictionList({ 
  predictions, 
  onSelectPrediction, 
  show 
}: AddressPredictionListProps) {
  if (!show || predictions.length === 0) {
    return null;
  }

  return (
    <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg">
      <ul className="py-1 max-h-60 overflow-auto">
        {predictions.map((prediction) => (
          <li
            key={prediction.place_id}
            onClick={() => onSelectPrediction(prediction)}
            className="px-3 py-2 hover:bg-accent cursor-pointer truncate text-sm"
          >
            {prediction.description}
          </li>
        ))}
      </ul>
    </div>
  );
}
