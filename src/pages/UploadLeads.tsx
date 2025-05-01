
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
    
    // Wait until authentication is finished loading
    if (isLoading) {
      console.log("Auth is still loading, waiting...");
      return;
    }
    
    setHasChecked(true);
    
    // Check if user is logged in and is a seller
    if (!isLoggedIn) {
      console.log("User is not logged in, redirecting to login");
      toast.error("Please log in to upload leads");
      navigate('/login');
      return;
    }
    
    if (role !== 'seller') {
      console.log("User is not a seller, redirecting to home", { actualRole: role });
      toast.error(`Only sellers can upload leads. Your current role is: ${role || 'not set'}`);
      
      // If role is null, suggest refreshing
      if (role === null) {
        toast.info("Your account role couldn't be determined. Try refreshing the page.");
      }
      
      navigate('/');
      return;
    }
    
    // Redirect to my-leads with upload tab active
    console.log("User is a seller, redirecting to upload tab");
    navigate('/my-leads?tab=upload');
  }, [isLoggedIn, role, navigate, isLoading, user?.id]);
  
  // Show a loading state
  if (isLoading || !hasChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Checking permissions...</p>
      </div>
    );
  }
  
  // This component doesn't render anything else as it's just for redirection
  return null;
};

export default UploadLeads;
