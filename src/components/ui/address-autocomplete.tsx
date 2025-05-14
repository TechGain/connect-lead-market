
import React, { useEffect, useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Loader } from 'lucide-react';

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
  const [inputValue, setInputValue] = useState(props.value as string || '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const autocompleteSessionToken = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<HTMLDivElement>(null);
  const scriptLoadingTimeout = useRef<NodeJS.Timeout | null>(null);

  // Load the Google Maps script
  useEffect(() => {
    // Check if script is already loaded
    if (window.google?.maps?.places) {
      setIsScriptLoaded(true);
      return;
    }

    // Don't reload if already attempting to load
    if (document.getElementById('google-maps-script')) {
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('Google Maps script loaded successfully');
      setIsScriptLoaded(true);
      if (scriptLoadingTimeout.current) {
        clearTimeout(scriptLoadingTimeout.current);
      }
    };
    
    script.onerror = () => {
      console.error('Failed to load Google Maps script');
    };
    
    document.head.appendChild(script);
    
    // Set a timeout to prevent infinite loading state
    scriptLoadingTimeout.current = setTimeout(() => {
      if (!isScriptLoaded) {
        console.warn('Google Maps script loading timed out');
        setIsScriptLoaded(false);
      }
    }, 10000);

    return () => {
      if (scriptLoadingTimeout.current) {
        clearTimeout(scriptLoadingTimeout.current);
      }
    };
  }, []);

  // Initialize Google Maps services when the script is loaded
  useEffect(() => {
    if (!isScriptLoaded || !window.google) return;
    
    try {
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
      
      // Create a dummy div for PlacesService (it needs a DOM element)
      const dummyDiv = document.createElement('div');
      placesService.current = new window.google.maps.places.PlacesService(dummyDiv);
      
      // Create a session token for better pricing
      autocompleteSessionToken.current = new window.google.maps.places.AutocompleteSessionToken();
      
      console.log('Google Maps services initialized');
    } catch (error) {
      console.error('Error initializing Google Maps services:', error);
    }
  }, [isScriptLoaded]);

  // Update internal state when prop value changes
  useEffect(() => {
    if (props.value !== undefined && props.value !== inputValue) {
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

  // Get predictions from Google Places API
  const getPlacePredictions = (input: string) => {
    if (!autocompleteService.current || input.length < 3 || !window.google) {
      setPredictions([]);
      return;
    }

    setIsLoading(true);

    try {
      autocompleteService.current.getPlacePredictions(
        {
          input,
          componentRestrictions: { country: 'us' }, // Restrict to US addresses
          sessionToken: autocompleteSessionToken.current,
          types: ['address'] // Only return addresses, not businesses, etc.
        },
        (results, status) => {
          setIsLoading(false);

          if (status !== window.google?.maps.places.PlacesServiceStatus.OK || !results) {
            console.log('No predictions found or status error:', status);
            setPredictions([]);
            return;
          }

          setPredictions(results);
        }
      );
    } catch (error) {
      console.error('Error getting place predictions:', error);
      setIsLoading(false);
      setPredictions([]);
    }
  };

  // Get place details including ZIP code when a prediction is selected
  const getPlaceDetails = (placeId: string, description: string) => {
    if (!placesService.current || !window.google) {
      onAddressSelect(description);
      return;
    }

    try {
      placesService.current.getDetails(
        {
          placeId,
          fields: ['address_components'],
          sessionToken: autocompleteSessionToken.current,
        },
        (result, status) => {
          if (status !== window.google?.maps.places.PlacesServiceStatus.OK || !result) {
            console.log('No place details found or status error:', status);
            onAddressSelect(description, placeId);
            return;
          }

          // Find ZIP code in address components
          const zipComponent = result.address_components?.find(
            component => component.types.includes('postal_code')
          );

          if (zipComponent && onZipCodeFound) {
            console.log('ZIP code found:', zipComponent.short_name);
            onZipCodeFound(zipComponent.short_name);
          }

          // Pass the selected address back to the parent component
          onAddressSelect(description, placeId);
          
          // Create a new session token for the next search
          if (window.google) {
            autocompleteSessionToken.current = new window.google.maps.places.AutocompleteSessionToken();
          }
        }
      );
    } catch (error) {
      console.error('Error getting place details:', error);
      onAddressSelect(description, placeId);
    }
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
        <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg">
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
