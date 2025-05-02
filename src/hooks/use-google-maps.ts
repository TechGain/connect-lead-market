
import { useState, useEffect } from 'react';
import { useGoogleMapsKey } from './use-google-maps-key';

export function useGoogleMaps() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const { apiKey, isLoading: isKeyLoading, error: keyError } = useGoogleMapsKey();

  useEffect(() => {
    // Wait for API key to load
    if (isKeyLoading) {
      console.log('Waiting for Google Maps API key to load');
      return;
    }

    // If there was an error getting the API key, set the error
    if (keyError) {
      console.error('Error getting Google Maps API key:', keyError);
      setLoadError(keyError);
      return;
    }
    
    // If no API key was found, set an error
    if (!apiKey) {
      console.error('No Google Maps API key available');
      setLoadError(new Error('Google Maps API key not available'));
      return;
    }

    // Skip if the script is already loaded
    if (window.google && window.google.maps) {
      console.log('Google Maps API already loaded');
      setIsLoaded(true);
      return;
    }

    // Skip if the script is already being loaded
    if (document.querySelector('script#google-maps-script')) {
      console.log('Google Maps API script is already being loaded');
      return;
    }

    console.log('Loading Google Maps API with key:', apiKey.substring(0, 5) + '...');
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
