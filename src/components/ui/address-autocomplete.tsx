
import React, { useEffect, useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Loader } from 'lucide-react';
import { useAddressAutocomplete, Prediction } from '@/hooks/use-address-autocomplete';

interface AddressAutocompleteInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onAddressSelect: (address: string, placeId?: string) => void;
  onZipCodeFound?: (zipCode: string) => void;
}

export function AddressAutocompleteInput({
  className,
  onAddressSelect,
  onZipCodeFound,
  ...props
}: AddressAutocompleteInputProps) {
  const [inputValue, setInputValue] = useState(props.value as string || '');
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<HTMLDivElement>(null);
  
  const {
    predictions,
    isLoading,
    showSuggestions,
    setShowSuggestions,
    getPlacePredictions,
    handleSelectPrediction
  } = useAddressAutocomplete();

  // Update internal state when prop value changes
  useEffect(() => {
    if (props.value !== undefined && props.value !== inputValue) {
      console.log('Updating input value from props:', props.value);
      setInputValue(props.value as string);
    }
  }, [props.value]);

  // Handle click outside to close the suggestions dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('Input changed to:', value);
    setInputValue(value);
    
    // Always pass the current value to parent even before autocomplete selection
    if (onAddressSelect) {
      onAddressSelect(value);
    }
    
    if (value) {
      setShowSuggestions(true);
      getPlacePredictions(value);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectPrediction = (prediction: Prediction) => {
    console.log('Prediction selected:', prediction.description);
    setInputValue(prediction.description);
    setShowSuggestions(false);
    handleSelectPrediction(prediction, onAddressSelect, onZipCodeFound);
  };

  return (
    <div className="relative w-full" ref={autocompleteRef}>
      <Input
        ref={inputRef}
        className={className}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => inputValue && predictions.length > 0 && setShowSuggestions(true)}
        {...props}
      />
      
      {/* Show loading indicator */}
      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <Loader className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      )}
      
      {/* Show predictions dropdown */}
      {showSuggestions && predictions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg">
          <ul className="py-1 max-h-60 overflow-auto">
            {predictions.map((prediction) => (
              <li
                key={prediction.place_id}
                onClick={() => selectPrediction(prediction)}
                className="px-3 py-2 hover:bg-accent cursor-pointer truncate text-sm"
              >
                {prediction.description}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
