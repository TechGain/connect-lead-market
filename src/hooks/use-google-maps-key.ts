
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
        
        // Try to get the API key from Supabase Edge Function
        const { data, error } = await supabase.functions.invoke('get-google-maps-api-key');
        
        if (error) {
          console.warn(`Couldn't fetch API key from Edge Function: ${error.message}`);
          throw error;
        }
        
        if (!data || !data.apiKey) {
          console.warn('No API key returned from server');
          throw new Error('No API key returned from server');
        }
        
        console.log('Successfully retrieved Google Maps API key');
        setApiKey(data.apiKey);
        
      } catch (err) {
        console.error('Failed to fetch Google Maps API key:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
        
        // Fall back to environment variable if available
        const envApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        if (envApiKey) {
          console.log('Using API key from environment variables');
          setApiKey(envApiKey);
          setError(null); // Clear error since we have a fallback
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchApiKey();
  }, []);

  return { apiKey, isLoading, error };
}
