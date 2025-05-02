
/// <reference types="vite/client" />

// Google Maps JavaScript API type definitions
declare namespace google.maps {
  class Map {
    constructor(mapDiv: HTMLElement, opts?: MapOptions);
  }

  interface MapOptions {
    center?: LatLng | LatLngLiteral;
    zoom?: number;
  }

  type LatLng = {
    lat(): number;
    lng(): number;
  };

  type LatLngLiteral = {
    lat: number;
    lng: number;
  };

  namespace places {
    class AutocompleteService {
      getPlacePredictions(
        request: AutocompletionRequest,
        callback: (predictions: AutocompletePrediction[] | null, status: PlacesServiceStatus) => void
      ): void;
    }

    class PlacesService {
      constructor(attrContainer: HTMLElement | Map);
      
      getDetails(
        request: PlaceDetailsRequest,
        callback: (result: PlaceResult | null, status: PlacesServiceStatus) => void
      ): void;
    }

    type AutocompletionRequest = {
      input: string;
      types?: string[];
      componentRestrictions?: {
        country: string | string[];
      };
    };

    type PlaceDetailsRequest = {
      placeId: string;
      fields?: string[];
    };

    type AutocompletePrediction = {
      description: string;
      place_id: string;
      structured_formatting?: {
        main_text: string;
        secondary_text: string;
      };
      terms?: {
        offset: number;
        value: string;
      }[];
      matched_substrings?: {
        length: number;
        offset: number;
      }[];
      types?: string[];
    };

    type AddressComponent = {
      long_name: string;
      short_name: string;
      types: string[];
    };

    interface PlaceResult {
      address_components?: AddressComponent[];
      formatted_address?: string;
      geometry?: {
        location: LatLng;
        viewport?: {
          north: number;
          south: number;
          east: number;
          west: number;
        };
      };
      name?: string;
      place_id?: string;
      types?: string[];
    }

    enum PlacesServiceStatus {
      OK = "OK",
      ZERO_RESULTS = "ZERO_RESULTS",
      OVER_QUERY_LIMIT = "OVER_QUERY_LIMIT",
      REQUEST_DENIED = "REQUEST_DENIED",
      INVALID_REQUEST = "INVALID_REQUEST",
      UNKNOWN_ERROR = "UNKNOWN_ERROR",
      NOT_FOUND = "NOT_FOUND"
    }
  }
}
