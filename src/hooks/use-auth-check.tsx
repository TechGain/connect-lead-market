
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { useUserRole } from '@/hooks/use-user-role';

export const useAuthCheck = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn, role, isLoading: authLoading } = useUserRole();
  
  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Check authentication and role first - with improved error handling
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!authLoading) {
          console.log('Auth loading completed, checking auth status:', { isLoggedIn, role });
          setAuthChecked(true);
          
          if (!isLoggedIn) {
            console.log('User not logged in, redirecting to login');
            toast.error("Please log in to access the marketplace");
            navigate('/login');
            return;
          }

          if (role !== 'buyer') {
            console.log('Access denied: User role is', role);
            setAuthError(`Only buyers can access the marketplace. Your role: ${role || 'not set'}`);
            return;
          }
          
          // Clear any previous auth errors if we got here successfully
          setAuthError(null);
        }
      } catch (error) {
        console.error('Error in auth checking:', error);
        setAuthError('Error verifying your account. Please try refreshing the page.');
        setAuthChecked(true); // Still mark as checked so we can show error UI
      }
    };
    
    checkAuth();
  }, [isLoggedIn, role, authLoading, navigate]);

  return {
    user,
    isLoggedIn,
    role,
    authLoading,
    authChecked,
    authError
  };
};
