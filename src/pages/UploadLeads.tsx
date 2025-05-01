
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/use-user-role';
import { toast } from 'sonner';

const UploadLeads = () => {
  const navigate = useNavigate();
  const { isLoggedIn, role, isLoading, user } = useUserRole();
  const [hasChecked, setHasChecked] = useState(false);
  
  useEffect(() => {
    // Log the current authentication state for debugging
    console.log("UploadLeads component - Current auth state:", { 
      isLoggedIn, 
      role,
      isLoading,
      userId: user?.id
    });
    
    // Force check to complete after a reasonable timeout to prevent infinite loading
    const timer = setTimeout(() => {
      if (!hasChecked) {
        console.log("Auth check timed out, proceeding with available info");
        setHasChecked(true);
      }
    }, 2000); // 2 seconds timeout
    
    // Wait until authentication is finished loading
    if (isLoading) {
      console.log("Auth is still loading, waiting...");
      return () => clearTimeout(timer);
    }
    
    setHasChecked(true);
    clearTimeout(timer);
    
    // Check if user is logged in and is a seller
    if (!isLoggedIn) {
      console.log("User is not logged in, redirecting to login");
      toast.error("Please log in to upload leads");
      navigate('/login');
      return;
    }
    
    // If role is null but user is logged in, proceed to my-leads anyway
    // This is a fallback to prevent getting stuck
    if (role === null && isLoggedIn) {
      console.log("User role is null but user is logged in, redirecting to my-leads");
      navigate('/my-leads?tab=upload');
      return;
    }
    
    if (role !== 'seller' && role !== null) {
      console.log("User is not a seller, redirecting to home", { actualRole: role });
      toast.error(`Only sellers can upload leads. Your current role is: ${role || 'not set'}`);
      navigate('/');
      return;
    }
    
    // Redirect to my-leads with upload tab active
    console.log("User is a seller or role checking bypassed, redirecting to upload tab");
    navigate('/my-leads?tab=upload');
  }, [isLoggedIn, role, navigate, isLoading, user?.id, hasChecked]);
  
  // Show a loading state with a timeout message
  if (isLoading || !hasChecked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="mb-2">Checking permissions...</p>
        <p className="text-sm text-gray-500">
          If this takes too long, try refreshing the page
        </p>
      </div>
    );
  }
  
  // This component doesn't render anything else as it's just for redirection
  return null;
};

export default UploadLeads;
