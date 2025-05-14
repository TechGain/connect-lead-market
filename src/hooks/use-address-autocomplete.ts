
import { useState, useCallback } from 'react';
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
  handleSelectPrediction: (prediction: Prediction, onAddressSelect: (address: string, placeId?: string) => void, onZipCodeFound?: (zipCode: string) => void) => void;
}

export function useAddressAutocomplete(): AddressAutocompleteHook {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  
  const { 
    isScriptLoaded, 
    isLoading: isGoogleLoading,
    error: googleError,
    autocompleteService, 
    placesService, 
    autocompleteSessionToken,
    createNewSessionToken 
  } = useGoogleMaps();

  // Get predictions from Google Places API
  const getPlacePredictions = useCallback((input: string) => {
    // Reset error state on new request
    setError(null);
    
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
    
    if (input.length < 3) {
      console.log('Input too short, minimum 3 characters required');
      setPredictions([]);
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
            setError(`Address lookup failed: ${status}`);
            setPredictions([]);
            return;
          }

          if (!results || results.length === 0) {
            console.log('No predictions found');
            setApiStatus('success');
            setPredictions([]);
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
    }
  }, [isGoogleLoading, googleError, autocompleteService, createNewSessionToken]);

  // Get place details including ZIP code when a prediction is selected
  const handleSelectPrediction = useCallback((
    prediction: Prediction, 
    onAddressSelect: (address: string, placeId?: string) => void, 
    onZipCodeFound?: (zipCode: string) => void
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
          fields: ['address_components'],
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

          // Find ZIP code in address components
          const zipComponent = result.address_components?.find(
            component => component.types.includes('postal_code')
          );

          if (zipComponent && onZipCodeFound) {
            const zipCode = zipComponent.short_name;
            console.log('ZIP code found:', zipCode);
            onZipCodeFound(zipCode);
          } else {
            console.log('No ZIP code found in address components');
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
