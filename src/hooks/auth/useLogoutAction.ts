
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook for handling user logout
 */
export function useLogoutAction() {
  const [isLoading, setIsLoading] = useState(false);

  const logout = async () => {
    try {
      console.log("Starting logout process");
      setIsLoading(true);
      
      // Thoroughly clean up all auth-related storage items first
      try {
        console.log("Clearing local storage auth items");
        const authItems = [
          'supabase.auth.token', 
          'supabase.auth.refreshToken', 
          'sb-bfmxxuarnqmxqqnpxqjf-auth-token',
          'supabase.auth.event',
          'supabase.auth.expires_at'
        ];
        
        authItems.forEach(key => {
          console.log(`Clearing ${key} from localStorage`);
          localStorage.removeItem(key);
        });
        
        // Clear any other relevant items
        Object.keys(localStorage).forEach(key => {
          if (key.includes('supabase') || 
              key.includes('auth') || 
              key.includes('user') || 
              key.includes('profile') || 
              key.includes('session') ||
              key.includes('sb-')) {
            console.log(`Clearing additional item: ${key}`);
            localStorage.removeItem(key);
          }
        });
      } catch (e) {
        console.error("Error clearing localStorage:", e);
      }
      
      // Only attempt the Supabase signOut after clearing storage
      try {
        console.log("Attempting Supabase signOut");
        await supabase.auth.signOut({
          scope: 'global' // This ensures all devices/tabs are signed out
        });
        console.log("Supabase signOut completed successfully");
      } catch (signOutError: any) {
        // Catch any signOut error but don't block - we'll continue with the page redirect
        console.error("Supabase signOut error:", signOutError);
        // Don't rethrow here - we want to continue with the page reload regardless
      }
      
      console.log("Logout successful, redirecting to home page");
      
      toast.success('Signed out successfully');
      
      // Use a small delay to ensure the toast is shown
      setTimeout(() => {
        // Force a complete page reload to clear any cached state
        window.location.href = '/';
      }, 500);
      
    } catch (error: any) {
      console.error("Error during logout:", error);
      toast.error(error.message || 'Failed to sign out');
      
      // Even if there was an error, try to force a reload as a fallback
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    logout,
    isLoading
  };
}
