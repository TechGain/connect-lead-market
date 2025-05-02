
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Define the type for the Google Maps Places prediction
interface Prediction {
  description: string;
  place_id: string;
}

export const useGooglePlacesAutocomplete = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch the API key from the Edge Function
  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.error('No active session found');
          return;
        }

        const { data, error } = await supabase.functions.invoke('get-google-maps-key', {
          method: 'GET'
        });

        if (error) {
          console.error('Error fetching Google Maps API key:', error);
          return;
        }

        if (data?.apiKey) {
          setApiKey(data.apiKey);
          loadGoogleMapsScript(data.apiKey);
        }
      } catch (error) {
        console.error('Error fetching Google Maps API key:', error);
      }
    };

    fetchApiKey();
  }, []);

  // Load the Google Maps JavaScript API script
  const loadGoogleMapsScript = useCallback((key: string) => {
    if (window.google?.maps?.places) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => {
      console.error('Failed to load Google Maps script');
      toast.error('Failed to load address autocomplete');
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // Get address predictions based on user input
  const getAddressPredictions = useCallback(async (input: string) => {
    if (!input || !scriptLoaded || !window.google?.maps?.places) {
      setPredictions([]);
      return;
    }

    setIsLoading(true);
    
    try {
      const autocompleteService = new window.google.maps.places.AutocompleteService();
      const results = await new Promise<google.maps.places.AutocompletePrediction[]>((resolve, reject) => {
        autocompleteService.getPlacePredictions(
          {
            input,
            types: ['address'],
            componentRestrictions: { country: 'us' } // Restrict to US addresses
          },
          (predictions, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
              resolve(predictions);
            } else {
              reject(status);
            }
          }
        );
      });
      
      setPredictions(
        results.map(result => ({
          description: result.description,
          place_id: result.place_id
        }))
      );
    } catch (error) {
      console.error('Error getting address predictions:', error);
      setPredictions([]);
    } finally {
      setIsLoading(false);
    }
  }, [scriptLoaded]);

  // Get details for a selected place
  const getPlaceDetails = useCallback(
    (placeId: string): Promise<{
      address: string;
      zipCode: string;
      city: string;
      state: string;
    }> => {
      return new Promise((resolve, reject) => {
        if (!window.google?.maps?.places) {
          reject('Google Maps Places API not loaded');
          return;
        }

        const map = new google.maps.Map(document.createElement('div'));
        const placesService = new google.maps.places.PlacesService(map);

        placesService.getDetails(
          {
            placeId,
            fields: ['address_component', 'formatted_address']
          },
          (place, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && place) {
              let zipCode = '';
              let city = '';
              let state = '';

              // Extract components from the address
              place.address_components?.forEach(component => {
                if (component.types.includes('postal_code')) {
                  zipCode = component.long_name;
                } else if (component.types.includes('locality')) {
                  city = component.long_name;
                } else if (component.types.includes('administrative_area_level_1')) {
                  state = component.long_name;
                }
              });

              resolve({
                address: place.formatted_address || '',
                zipCode,
                city,
                state
              });
            } else {
              reject(status);
            }
          }
        );
      });
    },
    [scriptLoaded]
  );

  return {
    apiKey,
    scriptLoaded,
    predictions,
    isLoading,
    getAddressPredictions,
    getPlaceDetails
  };
};

// Add TypeScript interface for the global window object
declare global {
  interface Window {
    google?: {
      maps?: {
        places: {
          AutocompleteService: new () => google.maps.places.AutocompleteService;
          PlacesService: new (
            attrContainer: HTMLElement | google.maps.Map
          ) => google.maps.places.PlacesService;
          PlacesServiceStatus: {
            OK: string;
          };
        };
        Map: new (mapDiv: HTMLElement, opts?: google.maps.MapOptions) => google.maps.Map;
      };
    };
  }
}
