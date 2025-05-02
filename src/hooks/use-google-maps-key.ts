
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useGoogleMapsKey() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [source, setSource] = useState<'edge-function' | 'environment' | null>(null);

  useEffect(() => {
    async function fetchApiKey() {
      try {
        setIsLoading(true);
        
        // Try to get the API key from environment variable first for faster loading
        const envApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        if (envApiKey) {
          console.log('Using Google Maps API key from environment variables');
          setApiKey(envApiKey);
          setSource('environment');
          setError(null);
          setIsLoading(false);
          return;
        }
        
        console.log('Fetching Google Maps API key from Edge Function...');
        
        // If no env key, fetch from Supabase Edge Function
        const { data, error: functionError } = await supabase.functions.invoke('get-google-maps-api-key', {
          method: 'GET'
        });
        
        if (functionError) {
          console.error('Edge Function error:', functionError);
          throw new Error(`Edge Function error: ${functionError.message}`);
        }
        
        if (!data || !data.apiKey) {
          console.error('No API key returned from server:', data);
          throw new Error('No API key returned from server');
        }
        
        console.log('Successfully retrieved Google Maps API key from Edge Function');
        setApiKey(data.apiKey);
        setSource('edge-function');
        
      } catch (err) {
        console.error('Failed to fetch Google Maps API key:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
        
        // Final fallback to environment variable if available
        const envApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        if (envApiKey) {
          console.log('Falling back to API key from environment variables');
          setApiKey(envApiKey);
          setSource('environment');
          setError(null); // Clear error since we have a fallback
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchApiKey();
  }, []);

  return { apiKey, isLoading, error, source };
}
