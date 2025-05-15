
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook for handling user login
 */
export function useLoginAction() {
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string) => {
    try {
      console.log("Attempting login with:", { email });
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      return data;
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || 'Failed to sign in');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    isLoading
  };
}
