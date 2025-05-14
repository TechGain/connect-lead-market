
import { useState, useEffect, useRef } from 'react';

// Define the Google Maps API key
const GOOGLE_MAPS_API_KEY = 'AIzaSyBLv7-Q7t2sqYjSdF03kUEYnJ3XmSs_DVg';

interface GoogleMapsServices {
  isScriptLoaded: boolean;
  autocompleteService: React.MutableRefObject<google.maps.places.AutocompleteService | null>;
  placesService: React.MutableRefObject<google.maps.places.PlacesService | null>;
  autocompleteSessionToken: React.MutableRefObject<google.maps.places.AutocompleteSessionToken | null>;
  createNewSessionToken: () => void;
}

export function useGoogleMaps(): GoogleMapsServices {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const autocompleteSessionToken = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const scriptLoadingTimeout = useRef<NodeJS.Timeout | null>(null);
  const mapDiv = useRef<HTMLDivElement | null>(null);

  const initializeServices = () => {
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      console.log('Google Maps API not available');
      return;
    }
    
    try {
      console.log('Initializing Google Maps services...');
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
      
      // Create a PlacesService with the mapDiv reference
      if (mapDiv.current) {
        placesService.current = new window.google.maps.places.PlacesService(mapDiv.current);
      }
      
      // Create a session token for better pricing
      autocompleteSessionToken.current = new window.google.maps.places.AutocompleteSessionToken();
      
      console.log('Google Maps services initialized');
    } catch (error) {
      console.error('Error initializing Google Maps services:', error);
    }
  };

  const createNewSessionToken = () => {
    if (window.google?.maps?.places) {
      autocompleteSessionToken.current = new window.google.maps.places.AutocompleteSessionToken();
    }
  };

  // Load the Google Maps script
  useEffect(() => {
    // Create a reference div for the PlacesService
    if (!mapDiv.current) {
      const div = document.createElement('div');
      div.style.display = 'none';
      document.body.appendChild(div);
      mapDiv.current = div;
    }

    // Check if script is already loaded
    if (window.google?.maps?.places) {
      console.log('Google Maps API already loaded');
      setIsScriptLoaded(true);
      initializeServices();
      return;
    }

    // Don't reload if already attempting to load
    if (document.getElementById('google-maps-script')) {
      console.log('Google Maps script is already being loaded');
      return;
    }

    console.log('Loading Google Maps API script...');
    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('Google Maps script loaded successfully');
      setIsScriptLoaded(true);
      initializeServices();
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
      
      // Clean up the map div on unmount
      if (mapDiv.current) {
        document.body.removeChild(mapDiv.current);
      }
    };
  }, []);

  return {
    isScriptLoaded,
    autocompleteService,
    placesService,
    autocompleteSessionToken,
    createNewSessionToken
  };
}
