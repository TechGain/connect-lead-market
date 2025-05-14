
/// <reference types="vite/client" />
/// <reference types="@types/google.maps" />

// Declare the Google namespace if it doesn't exist
interface Window {
  google?: {
    maps: {
      places: {
        AutocompleteService: new () => google.maps.places.AutocompleteService;
        PlacesService: new (attrContainer: HTMLElement) => google.maps.places.PlacesService;
        AutocompleteSessionToken: new () => google.maps.places.AutocompleteSessionToken;
        PlacesServiceStatus: {
          OK: string;
          ZERO_RESULTS: string;
          OVER_QUERY_LIMIT: string;
          REQUEST_DENIED: string;
          INVALID_REQUEST: string;
          UNKNOWN_ERROR: string;
        };
      };
    };
  };
}

