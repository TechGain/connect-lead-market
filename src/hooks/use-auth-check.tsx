
import { useState, useEffect } from 'react';
import { useUserRole } from '@/hooks/use-user-role';

export const useAuthCheck = () => {
  const { user, isLoggedIn, role, isLoading: authLoading, refreshUserRole } = useUserRole();
  
  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Check authentication state
  useEffect(() => {
    if (!authLoading) {
      console.log('Auth loading completed, checking auth status:', { isLoggedIn, role });
      setAuthChecked(true);
      
      // Clear any previous auth errors if auth is valid
      if (isLoggedIn && role === 'buyer') {
        setAuthError(null);
      } else if (isLoggedIn && role !== 'buyer') {
        console.log('Access denied: User role is', role);
        setAuthError(null); // We'll handle this display in the component
      }
    }
  }, [isLoggedIn, role, authLoading]);

  return {
    user,
    isLoggedIn,
    role,
    authLoading,
    authChecked,
    authError,
    refreshUserRole
  };
};
