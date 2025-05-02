
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
        
        const { data, error } = await supabase.functions.invoke('get-google-maps-api-key');
        
        if (error) {
          throw new Error(`Error fetching Google Maps API key: ${error.message}`);
        }
        
        if (!data || !data.apiKey) {
          throw new Error('No API key returned from server');
        }
        
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
