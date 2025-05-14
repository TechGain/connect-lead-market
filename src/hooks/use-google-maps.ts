
import { useState, useEffect, useRef } from 'react';

// Define the Google Maps API key
const GOOGLE_MAPS_API_KEY = 'AIzaSyBLv7-Q7t2sqYjSdF03kUEYnJ3XmSs_DVg';

interface GoogleMapsServices {
  isScriptLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  autocompleteService: React.MutableRefObject<google.maps.places.AutocompleteService | null>;
  placesService: React.MutableRefObject<google.maps.places.PlacesService | null>;
  autocompleteSessionToken: React.MutableRefObject<google.maps.places.AutocompleteSessionToken | null>;
  createNewSessionToken: () => void;
}

export function useGoogleMaps(): GoogleMapsServices {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const autocompleteSessionToken = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const scriptLoadingTimeout = useRef<NodeJS.Timeout | null>(null);
  const mapDiv = useRef<HTMLDivElement | null>(null);

  const initializeServices = () => {
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      console.error('Google Maps API not available after script load');
      setError('Google Maps API not loaded correctly');
      setIsLoading(false);
      return;
    }
    
    try {
      console.log('Initializing Google Maps services...');
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
      console.log('AutocompleteService created:', !!autocompleteService.current);
      
      // Create a PlacesService with the mapDiv reference
      if (mapDiv.current) {
        placesService.current = new window.google.maps.places.PlacesService(mapDiv.current);
        console.log('PlacesService created:', !!placesService.current);
      } else {
        console.error('mapDiv reference not available for PlacesService');
        setError('Failed to create PlacesService - mapDiv not available');
      }
      
      // Create a session token for better pricing
      createNewSessionToken();
      
      console.log('Google Maps services initialized successfully');
      setIsLoading(false);
    } catch (error) {
      console.error('Error initializing Google Maps services:', error);
      setError(`Failed to initialize Google Maps services: ${error}`);
      setIsLoading(false);
    }
  };

  const createNewSessionToken = () => {
    if (window.google?.maps?.places) {
      try {
        autocompleteSessionToken.current = new window.google.maps.places.AutocompleteSessionToken();
        console.log('Created new AutocompleteSessionToken');
      } catch (error) {
        console.error('Error creating session token:', error);
      }
    } else {
      console.warn('Cannot create session token - Google Maps not loaded');
    }
  };

  // Load the Google Maps script
  useEffect(() => {
    setIsLoading(true);
    
    // Create a reference div for the PlacesService
    if (!mapDiv.current) {
      const div = document.createElement('div');
      div.style.display = 'none';
      document.body.appendChild(div);
      mapDiv.current = div;
      console.log('Created mapDiv for PlacesService');
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
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=googleMapsCallback`;
    script.async = true;
    script.defer = true;
    
    // Define callback for when script loads
    window.googleMapsCallback = () => {
      console.log('Google Maps script loaded via callback');
      setIsScriptLoaded(true);
      setIsLoading(false);
      initializeServices();
      
      if (scriptLoadingTimeout.current) {
        clearTimeout(scriptLoadingTimeout.current);
      }
    };
    
    script.onerror = (event) => {
      console.error('Failed to load Google Maps script:', event);
      setError('Failed to load Google Maps script');
      setIsLoading(false);
    };
    
    document.head.appendChild(script);
    
    // Set a timeout to prevent infinite loading state
    scriptLoadingTimeout.current = setTimeout(() => {
      if (isLoading) {
        console.warn('Google Maps script loading timed out after 10 seconds');
        setIsLoading(false);
        setError('Google Maps API loading timed out - check your API key and network connection');
      }
    }, 10000); // 10 seconds timeout

    return () => {
      if (scriptLoadingTimeout.current) {
        clearTimeout(scriptLoadingTimeout.current);
      }
      
      // Clean up the map div on unmount
      if (mapDiv.current) {
        document.body.removeChild(mapDiv.current);
      }
      
      // Clean up the global callback
      delete window.googleMapsCallback;
    };
  }, []);

  return {
    isScriptLoaded,
    isLoading,
    error,
    autocompleteService,
    placesService,
    autocompleteSessionToken,
    createNewSessionToken
  };
}

// Add the callback to the window type
declare global {
  interface Window {
    googleMapsCallback?: () => void;
  }
}
