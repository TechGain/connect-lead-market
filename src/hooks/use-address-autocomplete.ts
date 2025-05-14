
import { useState } from 'react';
import { useGoogleMaps } from './use-google-maps';

// Define the type for place predictions
export interface Prediction {
  description: string;
  place_id: string;
}

interface AddressAutocompleteHook {
  predictions: Prediction[];
  isLoading: boolean;
  showSuggestions: boolean;
  setShowSuggestions: (show: boolean) => void;
  getPlacePredictions: (input: string) => void;
  handleSelectPrediction: (prediction: Prediction, onAddressSelect: (address: string, placeId?: string) => void, onZipCodeFound?: (zipCode: string) => void) => void;
}

export function useAddressAutocomplete(): AddressAutocompleteHook {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const { 
    isScriptLoaded, 
    autocompleteService, 
    placesService, 
    autocompleteSessionToken,
    createNewSessionToken 
  } = useGoogleMaps();

  // Get predictions from Google Places API
  const getPlacePredictions = (input: string) => {
    if (!autocompleteService.current || input.length < 3 || !window.google) {
      console.log('Cannot get place predictions:', 
                  !autocompleteService.current ? 'autocomplete service not initialized' : 
                  input.length < 3 ? 'input too short' : 'Google Maps not loaded');
      setPredictions([]);
      return;
    }

    console.log('Getting place predictions for:', input);
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

          console.log('Predictions found:', results.length);
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
  const handleSelectPrediction = (
    prediction: Prediction, 
    onAddressSelect: (address: string, placeId?: string) => void, 
    onZipCodeFound?: (zipCode: string) => void
  ) => {
    const description = prediction.description;
    const placeId = prediction.place_id;

    if (!placesService.current || !window.google) {
      console.log('Cannot get place details: service not initialized or Google Maps not loaded');
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
          if (status !== window.google?.maps.places.PlacesServiceStatus.OK || !result) {
            console.log('No place details found or status error:', status);
            onAddressSelect(description, placeId);
            return;
          }

          console.log('Place details found:', result);

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
          createNewSessionToken();
        }
      );
    } catch (error) {
      console.error('Error getting place details:', error);
      onAddressSelect(description, placeId);
    }
  };

  return {
    predictions,
    isLoading,
    showSuggestions,
    setShowSuggestions,
    getPlacePredictions,
    handleSelectPrediction
  };
}
