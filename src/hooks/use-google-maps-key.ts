
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useGoogleMapsKey() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchApiKey() {
      try {
        setIsLoading(true);
        
        // First, check if we have the API key in environment variables
        if (import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
          console.log('Using Google Maps API key from environment variables');
          setApiKey(import.meta.env.VITE_GOOGLE_MAPS_API_KEY);
          return;
        }
        
        // If not, try to fetch from Supabase Edge Function
        console.log('Fetching Google Maps API key from Supabase Edge Function');
        const { data, error } = await supabase.functions.invoke('get-google-maps-api-key');
        
        if (error) {
          throw new Error(`Error fetching Google Maps API key: ${error.message}`);
        }
        
        if (!data || !data.apiKey) {
          throw new Error('No API key returned from server');
        }
        
        console.log('Successfully retrieved Google Maps API key from Edge Function');
        setApiKey(data.apiKey);
        
      } catch (err) {
        console.error('Failed to fetch Google Maps API key:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    }

    fetchApiKey();
  }, []);

  return { apiKey, isLoading, error };
}
