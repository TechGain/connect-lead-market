
import { useState, useEffect } from 'react';
import { useGoogleMapsKey } from './use-google-maps-key';

export function useGoogleMaps() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const { apiKey, isLoading: isKeyLoading, error: keyError, source } = useGoogleMapsKey();

  useEffect(() => {
    // Wait for API key to load, but don't block UI
    if (isKeyLoading) {
      console.log('Waiting for Google Maps API key...');
      return;
    }

    // If there was an error getting the API key, set the error but don't block UI
    if (keyError) {
      console.error('Error getting Google Maps API key:', keyError);
      setLoadError(keyError);
      return;
    }

    // Skip if we don't have an API key
    if (!apiKey) {
      console.warn('No Google Maps API key available');
      setLoadError(new Error('No Google Maps API key available'));
      return;
    }

    // Skip if the script is already loaded
    if (window.google && window.google.maps) {
      console.log('Google Maps API already loaded');
      setIsLoaded(true);
      return;
    }

    // Skip if the script is already being loaded
    const existingScript = document.querySelector('script#google-maps-script');
    if (existingScript) {
      console.log('Google Maps API script is already being loaded');
      return;
    }

    console.log(`Loading Google Maps API with key from ${source}...`);
    
    // Create and append the script
    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    // Add event listeners for debugging
    script.addEventListener('load', () => {
      console.log('Google Maps API script loaded successfully');
      if (window.google && window.google.maps && window.google.maps.places) {
        console.log('Places API is available');
        setIsLoaded(true);
      } else {
        console.error('Places library not available. Make sure it\'s enabled in your Google Cloud Console');
        setLoadError(new Error('Google Maps Places library not available'));
      }
    });

    script.addEventListener('error', (event) => {
      console.error('Error loading Google Maps API script:', event);
      setLoadError(new Error('Failed to load Google Maps API'));
    });

    console.log('Adding Google Maps script to document head');
    document.head.appendChild(script);

    return () => {
      // Clean up only if the component is unmounted before the script loads
      if (!isLoaded && document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [apiKey, isKeyLoading, keyError, source]);

  return { isLoaded, loadError };
}
