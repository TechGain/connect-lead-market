
import { useState, useCallback, useEffect } from 'react';
import { useGoogleMaps } from './use-google-maps';

// Define the type for place predictions
export interface Prediction {
  description: string;
  place_id: string;
  structured_formatting?: {
    main_text: string;
    secondary_text: string;
  };
}

interface AddressAutocompleteHook {
  predictions: Prediction[];
  isLoading: boolean;
  showSuggestions: boolean;
  error: string | null;
  apiStatus: 'idle' | 'loading' | 'success' | 'error';
  setShowSuggestions: (show: boolean) => void;
  getPlacePredictions: (input: string) => void;
  handleSelectPrediction: (prediction: Prediction, onAddressSelect: (address: string, placeId?: string) => void, onZipCodeFound?: (zipCode: string) => void, onCityFound?: (city: string) => void) => void;
}

export function useAddressAutocomplete(): AddressAutocompleteHook {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [inputValue, setInputValue] = useState('');
  
  const { 
    isScriptLoaded, 
    isLoading: isGoogleLoading,
    error: googleError,
    autocompleteService, 
    placesService, 
    autocompleteSessionToken,
    createNewSessionToken 
  } = useGoogleMaps();

  // Debug effect to track state changes
  useEffect(() => {
    console.log('Address Autocomplete State:', {
      isScriptLoaded,
      isGoogleLoading,
      googleError,
      hasAutocompleteService: !!autocompleteService.current,
      hasPlacesService: !!placesService.current,
      hasSessionToken: !!autocompleteSessionToken.current,
      predictionsCount: predictions.length,
      showSuggestions,
      apiStatus
    });
  }, [
    isScriptLoaded, 
    isGoogleLoading, 
    googleError, 
    autocompleteService.current, 
    placesService.current,
    predictions, 
    showSuggestions,
    apiStatus
  ]);

  // Get predictions from Google Places API
  const getPlacePredictions = useCallback((input: string) => {
    // Reset error state on new request
    setError(null);
    setInputValue(input);
    
    if (!input || input.length < 3) {
      console.log('Input too short, minimum 3 characters required');
      setPredictions([]);
      setShowSuggestions(false);
      return;
    }
    
    if (isGoogleLoading) {
      console.log('Google Maps is still loading, waiting...');
      return;
    }
    
    if (googleError) {
      console.error('Google Maps failed to load:', googleError);
      setError(`Google Maps failed to load: ${googleError}`);
      return;
    }
    
    if (!autocompleteService.current) {
      console.error('Autocomplete service not initialized');
      setError('Address autocomplete service not available');
      return;
    }
    
    if (!window.google) {
      console.error('Google Maps not loaded');
      setError('Google Maps API not loaded');
      return;
    }

    console.log('Getting place predictions for:', input);
    setIsLoading(true);
    setApiStatus('loading');

    try {
      // Ensure we have a valid session token
      if (!autocompleteSessionToken.current) {
        createNewSessionToken();
      }
      
      autocompleteService.current.getPlacePredictions(
        {
          input,
          componentRestrictions: { country: 'us' }, // Restrict to US addresses
          sessionToken: autocompleteSessionToken.current,
          types: ['address'] // Only return addresses, not businesses, etc.
        },
        (results, status) => {
          setIsLoading(false);

          if (status !== window.google?.maps.places.PlacesServiceStatus.OK) {
            console.error('Autocomplete API error status:', status);
            setApiStatus('error');
            
            if (status === window.google?.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
              console.log('No predictions found for input:', input);
              setPredictions([]);
              setShowSuggestions(true); // Show the "no results" message
            } else {
              setError(`Address lookup failed: ${status}`);
              setPredictions([]);
              setShowSuggestions(false);
            }
            return;
          }

          if (!results || results.length === 0) {
            console.log('No predictions found');
            setApiStatus('success');
            setPredictions([]);
            setShowSuggestions(false);
            return;
          }

          console.log('Predictions found:', results.length, results);
          setApiStatus('success');
          setPredictions(results);
          setShowSuggestions(true);
        }
      );
    } catch (error) {
      console.error('Error getting place predictions:', error);
      setIsLoading(false);
      setApiStatus('error');
      setError(`Error searching for addresses: ${error}`);
      setPredictions([]);
      setShowSuggestions(false);
    }
  }, [isGoogleLoading, googleError, autocompleteService, createNewSessionToken]);

  // Get place details including ZIP code and city when a prediction is selected
  const handleSelectPrediction = useCallback((
    prediction: Prediction, 
    onAddressSelect: (address: string, placeId?: string) => void, 
    onZipCodeFound?: (zipCode: string) => void,
    onCityFound?: (city: string) => void
  ) => {
    const description = prediction.description;
    const placeId = prediction.place_id;
    console.log('Selected prediction:', prediction);

    if (!placesService.current || !window.google) {
      console.error('Places service not available');
      onAddressSelect(description);
      return;
    }

    console.log('Getting place details for:', description, 'with ID:', placeId);
    
    try {
      placesService.current.getDetails(
        {
          placeId,
          fields: ['address_components', 'formatted_address'],
          sessionToken: autocompleteSessionToken.current,
        },
        (result, status) => {
          if (status !== window.google?.maps.places.PlacesServiceStatus.OK) {
            console.error('Place details API error status:', status);
            onAddressSelect(description, placeId);
            return;
          }

          if (!result) {
            console.error('No place details found');
            onAddressSelect(description, placeId);
            return;
          }

          console.log('Place details found:', result);
          console.log('Address components:', result.address_components);

          // Extract information from address components
          let zipCode = '';
          let city = '';

          if (result.address_components) {
            result.address_components.forEach(component => {
              console.log('Processing component:', component.long_name, 'Types:', component.types);
              
              // Extract ZIP code
              if (component.types.includes('postal_code')) {
                zipCode = component.short_name;
                console.log('ZIP code found from component:', zipCode);
              }
              
              // Extract city - prioritize locality, then administrative_area_level_1
              if (component.types.includes('locality')) {
                city = component.long_name;
                console.log('City found from locality:', city);
              } else if (component.types.includes('administrative_area_level_1') && !city) {
                city = component.long_name;
                console.log('City found from administrative_area_level_1:', city);
              }
            });
          }

          // If we didn't find city in components, try to extract from the description
          if (!city) {
            console.log('City not found in components, trying to extract from description:', description);
            const parts = description.split(',').map(part => part.trim());
            console.log('Description parts:', parts);
            
            // For format like "Street, City, State, Country"
            if (parts.length >= 3) {
              // The city is typically the second part (index 1)
              const potentialCity = parts[1];
              if (potentialCity && !potentialCity.match(/\d/) && potentialCity.length > 1) {
                city = potentialCity;
                console.log('City extracted from description:', city);
              }
            }
          }

          // Call the callbacks with the extracted information
          if (zipCode && onZipCodeFound) {
            console.log('Calling onZipCodeFound with:', zipCode);
            onZipCodeFound(zipCode);
          }

          if (city && onCityFound) {
            console.log('Calling onCityFound with:', city);
            onCityFound(city);
          }

          // Pass the selected address back to the parent component
          onAddressSelect(description, placeId);
          
          // Create a new session token for the next search
          createNewSessionToken();
        }
      );
    } catch (error) {
      console.error('Error getting place details:', error);
      onAddressSelect(description, placeId);
    }
  }, [placesService, createNewSessionToken]);

  return {
    predictions,
    isLoading,
    showSuggestions,
    error,
    apiStatus,
    setShowSuggestions,
    getPlacePredictions,
    handleSelectPrediction
  };
}
