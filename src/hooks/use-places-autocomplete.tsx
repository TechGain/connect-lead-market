
import { useState, useRef, useEffect } from 'react';

// Define the type for place predictions
export interface Prediction {
  description: string;
  place_id: string;
}

export interface PlacesAutocompleteResult {
  predictions: Prediction[];
  isLoading: boolean;
  getPlacePredictions: (input: string) => void;
  handleSelectPrediction: (prediction: Prediction) => void;
  getPlaceDetails: (placeId: string, description: string) => void;
}

export function usePlacesAutocomplete(
  onAddressSelect: (address: string, placeId?: string) => void,
  onZipCodeFound?: (zipCode: string) => void
): PlacesAutocompleteResult {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const autocompleteSessionToken = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);

  // Initialize Google Maps services when the script is loaded
  useEffect(() => {
    if (!window.google?.maps) return;
    
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
  }, [window.google]);

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

  const handleSelectPrediction = (prediction: Prediction) => {
    console.log("Selected prediction:", prediction);
    getPlaceDetails(prediction.place_id, prediction.description);
  };

  return {
    predictions,
    isLoading,
    getPlacePredictions,
    handleSelectPrediction,
    getPlaceDetails
  };
}
