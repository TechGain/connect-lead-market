
import React, { useRef, useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
import { useGoogleMaps } from '@/hooks/use-google-maps';

interface AddressAutocompleteProps {
  value: string;
  onChange: (address: string) => void;
  onZipCodeFound: (zipCode: string) => void;
  required?: boolean;
  id?: string;
}

export const AddressAutocomplete = ({ 
  value, 
  onChange, 
  onZipCodeFound,
  required = false,
  id = 'address'
}: AddressAutocompleteProps) => {
  const { isLoaded, loadError } = useGoogleMaps();
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize the autocomplete once the Google Maps API is loaded
  useEffect(() => {
    if (!isLoaded || !inputRef.current) return;

    try {
      // Create the autocomplete object
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'us' }, // Restrict to US addresses
        fields: ['address_components', 'formatted_address']
      });

      // Add a listener for when a place is selected
      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace();
        
        if (!place || !place.address_components) {
          setError('Invalid address selected');
          return;
        }

        // Parse the address components
        let zipCode = '';
        for (const component of place.address_components) {
          if (component.types.includes('postal_code')) {
            zipCode = component.short_name;
            break;
          }
        }

        // Update form values
        onChange(place.formatted_address || '');
        
        if (zipCode) {
          onZipCodeFound(zipCode);
        }
        
        setError(null);
      });
    } catch (err) {
      console.error('Error initializing Google Maps Autocomplete:', err);
      setError('Failed to initialize address autocomplete');
    }

    // Clean up
    return () => {
      if (autocompleteRef.current && window.google) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [isLoaded, onChange, onZipCodeFound]);

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Property Address {required && '*'}</Label>
      <div>
        <Input
          id={id}
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Start typing address..."
          required={required}
          aria-invalid={!!error || !!loadError}
          disabled={false} // Always enable input regardless of API loading status
        />
        {(error || loadError) && (
          <div className="flex items-center text-sm text-red-500 mt-1">
            <AlertCircle className="h-4 w-4 mr-1" />
            <span>
              {error || 'Address autocomplete unavailable. You can still type your address manually.'}
            </span>
          </div>
        )}
        {isLoaded && !error && (
          <p className="text-xs text-muted-foreground mt-1">
            Start typing to see address suggestions
          </p>
        )}
        {!isLoaded && !loadError && (
          <p className="text-xs text-muted-foreground mt-1">
            Loading address autocomplete...
          </p>
        )}
        {loadError && (
          <p className="text-xs text-muted-foreground mt-1">
            Autocomplete unavailable. Please enter address manually.
          </p>
        )}
      </div>
    </div>
  );
};
