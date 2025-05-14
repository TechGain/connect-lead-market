
import React, { useEffect, useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Loader } from 'lucide-react';
import { cn } from '@/lib/utils';

// Define the Google Maps API key
const GOOGLE_MAPS_API_KEY = 'AIzaSyBLv7-Q7t2sqYjSdF03kUEYnJ3XmSs_DVg';

// Define the type for place predictions
interface Prediction {
  description: string;
  place_id: string;
}

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
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const autocompleteSessionToken = useRef<any>(null);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<HTMLDivElement>(null);

  // Load the Google Maps script
  useEffect(() => {
    if (window.google?.maps?.places) {
      setIsScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.onload = () => {
      setIsScriptLoaded(true);
    };
    script.onerror = () => {
      console.error('Failed to load Google Maps script');
    };
    document.head.appendChild(script);

    return () => {
      // Clean up the script if the component unmounts before the script loads
      document.head.removeChild(script);
    };
  }, []);

  // Initialize Google Maps services when the script is loaded
  useEffect(() => {
    if (!isScriptLoaded || !window.google) return;

    autocompleteService.current = new google.maps.places.AutocompleteService();
    
    // Create a dummy div for PlacesService (it needs a DOM element)
    const dummyDiv = document.createElement('div');
    placesService.current = new google.maps.places.PlacesService(dummyDiv);
    
    // Create a session token for better pricing
    autocompleteSessionToken.current = new google.maps.places.AutocompleteSessionToken();
  }, [isScriptLoaded]);

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

  // Get predictions from Google Places API
  const getPlacePredictions = (input: string) => {
    if (!autocompleteService.current || input.length < 3) {
      setPredictions([]);
      return;
    }

    setIsLoading(true);

    autocompleteService.current.getPlacePredictions(
      {
        input,
        componentRestrictions: { country: 'us' }, // Restrict to US addresses
        sessionToken: autocompleteSessionToken.current,
        types: ['address'] // Only return addresses, not businesses, etc.
      },
      (results, status) => {
        setIsLoading(false);

        if (status !== google.maps.places.PlacesServiceStatus.OK || !results) {
          setPredictions([]);
          return;
        }

        setPredictions(results);
      }
    );
  };

  // Get place details including ZIP code when a prediction is selected
  const getPlaceDetails = (placeId: string, description: string) => {
    if (!placesService.current) return;

    placesService.current.getDetails(
      {
        placeId,
        fields: ['address_components'],
        sessionToken: autocompleteSessionToken.current,
      },
      (result, status) => {
        if (status !== google.maps.places.PlacesServiceStatus.OK || !result) {
          onAddressSelect(description, placeId);
          return;
        }

        // Find ZIP code in address components
        const zipComponent = result.address_components?.find(
          component => component.types.includes('postal_code')
        );

        if (zipComponent && onZipCodeFound) {
          onZipCodeFound(zipComponent.short_name);
        }

        // Pass the selected address back to the parent component
        onAddressSelect(description, placeId);
        
        // Create a new session token for the next search
        autocompleteSessionToken.current = new google.maps.places.AutocompleteSessionToken();
      }
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    if (value) {
      setShowSuggestions(true);
      getPlacePredictions(value);
    } else {
      setShowSuggestions(false);
      setPredictions([]);
    }
  };

  const handleSelectPrediction = (prediction: Prediction) => {
    setInputValue(prediction.description);
    setShowSuggestions(false);
    getPlaceDetails(prediction.place_id, prediction.description);
  };

  return (
    <div className="relative w-full" ref={autocompleteRef}>
      <Input
        ref={inputRef}
        className={className}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => inputValue && setShowSuggestions(true)}
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
        <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg">
          <ul className="py-1 max-h-60 overflow-auto">
            {predictions.map((prediction) => (
              <li
                key={prediction.place_id}
                onClick={() => handleSelectPrediction(prediction)}
                className="px-3 py-2 hover:bg-accent cursor-pointer truncate text-sm"
              >
                {prediction.description}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Show message if Google Maps script failed to load */}
      {!isScriptLoaded && (
        <div className="text-xs text-destructive mt-1">
          Loading Google Maps...
        </div>
      )}
    </div>
  );
}
