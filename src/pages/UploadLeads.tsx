
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/use-user-role';
import { toast } from 'sonner';

const UploadLeads = () => {
  const navigate = useNavigate();
  const { isLoggedIn, role, isLoading } = useUserRole();
  
  useEffect(() => {
    // Log the current authentication state for debugging
    console.log("UploadLeads component - Current auth state:", { 
      isLoggedIn, 
      role,
      isLoading
    });
    
    // Wait until authentication is finished loading
    if (isLoading) {
      console.log("Auth is still loading, waiting...");
      return;
    }
    
    // Check if user is logged in and is a seller
    if (!isLoggedIn) {
      console.log("User is not logged in, redirecting to login");
      toast.error("Please log in to upload leads");
      navigate('/login');
      return;
    }
    
    if (role !== 'seller') {
      console.log("User is not a seller, redirecting to home");
      toast.error("Only sellers can upload leads");
      navigate('/');
      return;
    }
    
    // Redirect to my-leads with upload tab active
    console.log("User is a seller, redirecting to upload tab");
    navigate('/my-leads?tab=upload');
  }, [isLoggedIn, role, navigate, isLoading]);
  
  // This component doesn't render anything as it's just for redirection
  return null;
};

export default UploadLeads;
