
import { useState, useEffect } from 'react';
import { NavigateFunction } from 'react-router-dom';
import { toast } from 'sonner';

export const useLeadsAuth = (
  isLoggedIn: boolean, 
  role: string | null, 
  isAdmin: boolean, 
  isLoading: boolean,
  refreshUserRole: () => void,
  navigate: NavigateFunction
) => {
  const [hasChecked, setHasChecked] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  
  useEffect(() => {
    // Log the current authentication state for debugging
    console.log("useLeadsAuth hook - Current auth state:", { 
      isLoggedIn, 
      role,
      isAdmin,
      isLoading,
      hasChecked,
      loadingTimeout
    });
    
    // Force check to complete after a reasonable timeout to prevent infinite loading
    const timer = setTimeout(() => {
      if (!hasChecked || isLoading) {
        console.log("Auth check timed out, proceeding with available info");
        setHasChecked(true);
        setLoadingTimeout(true);
      }
    }, 3000); // 3 seconds timeout
    
    // Wait until authentication is finished loading or timeout occurs
    if (isLoading && !loadingTimeout) {
      console.log("Auth is still loading, waiting...");
      return () => clearTimeout(timer);
    }
    
    setHasChecked(true);
    clearTimeout(timer);
    
    // Check if user is logged in
    if (!isLoggedIn) {
      console.log("User is not logged in, redirecting to login");
      toast.error("Please log in to view your leads");
      navigate('/login', { 
        replace: true,
        state: { returnTo: '/my-leads' }
      });
      return;
    }
    
    // Check if user has a role
    if (role === null) {
      console.log("User role is null, showing fallback UI");
      toast.error("Unable to determine your role. Please try again.");
      return;
    }
    
    // Check if user is a seller, admin or buyer
    if (role !== 'seller' && role !== 'buyer' && !isAdmin) {
      console.log("User is not a seller, buyer or admin, redirecting to home", { actualRole: role });
      toast.error(`Only sellers, buyers and admins can view this page. Your current role is: ${role}`);
      navigate('/', { replace: true });
      return;
    }
  }, [isLoggedIn, role, isAdmin, isLoading, hasChecked, loadingTimeout, navigate]);

  const handleRefresh = () => {
    refreshUserRole();
    toast.info("Refreshing user role...");
    setLoadingTimeout(false);
    setHasChecked(false);
  };

  return {
    hasChecked,
    loadingTimeout,
    handleRefresh
  };
};
