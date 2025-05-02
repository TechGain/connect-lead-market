
import { useState, useEffect } from 'react';
import { useGoogleMapsKey } from './use-google-maps-key';

export function useGoogleMaps() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const { apiKey, isLoading: isKeyLoading, error: keyError } = useGoogleMapsKey();

  useEffect(() => {
    // Wait for API key to load
    if (isKeyLoading || !apiKey) return;

    // If there was an error getting the API key, set the error
    if (keyError) {
      setLoadError(keyError);
      return;
    }

    // Skip if the script is already loaded
    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }

    // Skip if the script is already being loaded
    if (document.querySelector('script#google-maps-script')) {
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('Google Maps API loaded successfully');
      setIsLoaded(true);
    };

    script.onerror = (error) => {
      console.error('Error loading Google Maps API:', error);
      setLoadError(new Error('Failed to load Google Maps API'));
    };

    document.head.appendChild(script);

    return () => {
      // Clean up only if the component is unmounted before the script loads
      if (!isLoaded && document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [apiKey, isKeyLoading, keyError]);

  return { isLoaded, loadError };
}
