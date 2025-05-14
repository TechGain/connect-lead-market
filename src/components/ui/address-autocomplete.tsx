
import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Loader } from 'lucide-react';
import { useGoogleMapsScript } from '@/hooks/use-google-maps-script';
import { usePlacesAutocomplete } from '@/hooks/use-places-autocomplete';
import { AddressPredictionList } from '@/components/ui/address-prediction-list';

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
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<HTMLDivElement>(null);
  
  const { isScriptLoaded } = useGoogleMapsScript();
  
  const { 
    predictions, 
    isLoading, 
    getPlacePredictions, 
    handleSelectPrediction 
  } = usePlacesAutocomplete(onAddressSelect, onZipCodeFound);

  // Update internal state when prop value changes
  useEffect(() => {
    if (props.value !== undefined && props.value !== inputValue) {
      console.log("Updating input value from props:", props.value);
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
    console.log("Address input change:", value);
    
    // Update the input value immediately to ensure typing works
    setInputValue(value);
    
    if (value) {
      setShowSuggestions(true);
      // Only get predictions if value is long enough
      if (value.length >= 3) {
        getPlacePredictions(value);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const onSelectSuggestion = (prediction: { description: string; place_id: string }) => {
    setInputValue(prediction.description);
    setShowSuggestions(false);
    handleSelectPrediction(prediction);
  };

  return (
    <div className="relative w-full" ref={autocompleteRef}>
      <Input
        ref={inputRef}
        className={className}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => inputValue && inputValue.length >= 3 && setShowSuggestions(true)}
        {...props}
      />
      
      {/* Show loading indicator */}
      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <Loader className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      )}
      
      {/* Show predictions dropdown using the extracted component */}
      <AddressPredictionList 
        predictions={predictions}
        onSelectPrediction={onSelectSuggestion}
        show={showSuggestions}
      />
      
      {/* Show message if Google Maps script failed to load */}
      {!isScriptLoaded && (
        <div className="text-xs text-destructive mt-1">
          Loading Google Maps...
        </div>
      )}
    </div>
  );
}
