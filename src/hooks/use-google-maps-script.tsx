
import { useEffect, useState, useRef } from 'react';

// Define the Google Maps API key
const GOOGLE_MAPS_API_KEY = 'AIzaSyBLv7-Q7t2sqYjSdF03kUEYnJ3XmSs_DVg';

/**
 * Hook to load Google Maps script and track its loading state
 */
export function useGoogleMapsScript() {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const scriptLoadingTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check if script is already loaded
    if (window.google?.maps?.places) {
      console.log("Google Maps already loaded");
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

  return { isScriptLoaded };
}
