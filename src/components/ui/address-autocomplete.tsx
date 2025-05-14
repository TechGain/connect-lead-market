
import React, { useEffect, useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Loader, AlertCircle } from 'lucide-react';
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
    error,
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
  }, [setShowSuggestions]);

  // Debug console log for predictions
  useEffect(() => {
    if (predictions.length > 0) {
      console.log('Address predictions available:', predictions.length);
    }
  }, [predictions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('Address input changed to:', value);
    setInputValue(value);
    
    // Always pass the current value to parent even before autocomplete selection
    if (onAddressSelect) {
      onAddressSelect(value);
    }
    
    if (value) {
      getPlacePredictions(value);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleInputFocus = () => {
    console.log('Input focused, current value:', inputValue);
    if (inputValue && predictions.length > 0) {
      console.log('Showing suggestions on focus');
      setShowSuggestions(true);
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
        onFocus={handleInputFocus}
        onClick={() => inputValue && predictions.length > 0 && setShowSuggestions(true)}
        {...props}
      />
      
      {/* Show loading indicator */}
      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <Loader className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Show error state */}
      {error && (
        <div className="text-destructive text-xs mt-1 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          <span>{error}</span>
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
                {prediction.structured_formatting ? (
                  <>
                    <span className="font-medium">{prediction.structured_formatting.main_text}</span>
                    <span className="text-muted-foreground"> {prediction.structured_formatting.secondary_text}</span>
                  </>
                ) : (
                  prediction.description
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Show "no results" message when search is complete but no results found */}
      {inputValue && !isLoading && predictions.length === 0 && showSuggestions && !error && (
        <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg">
          <div className="px-3 py-2 text-sm text-muted-foreground">
            No addresses found. Try a different search.
          </div>
        </div>
      )}
    </div>
  );
}
