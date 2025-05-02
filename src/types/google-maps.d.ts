
/// <reference types="googlemaps" />

// Add custom type declarations if needed
declare namespace google.maps.places {
  interface PlaceResult {
    address_components?: google.maps.GeocoderAddressComponent[];
    formatted_address?: string;
  }
}
