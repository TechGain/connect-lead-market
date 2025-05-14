
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/use-user-role';
import { toast } from 'sonner';

const UploadLeads = () => {
  const navigate = useNavigate();
  const { isLoggedIn, role, isAdmin } = useUserRole();
  
  useEffect(() => {
    // Log the current authentication state for debugging
    console.log("UploadLeads component - preparing to navigate to my-leads with upload tab");
    
    if (!isLoggedIn) {
      toast.error("Please log in to upload leads");
      navigate('/login', { replace: true });
      return;
    }
    
    if (role !== 'seller' && !isAdmin) {
      toast.error(`Only sellers and admins can upload leads. Your current role is: ${role || 'not set'}`);
      navigate('/', { replace: true });
      return;
    }
    
    // Fix: Use proper navigation state to prevent full page refresh
    console.log("Navigating to /my-leads?tab=upload without page refresh");
    
    // Ensure we use the navigate function in a way that doesn't trigger refreshes in the Lovable iframe
    navigate('/my-leads', { 
      replace: true,
      state: { 
        initialTab: 'upload',
        preventTabChange: false 
      }
    });
  }, [isLoggedIn, role, navigate, isAdmin]);
  
  // This component doesn't render anything as it's just for redirection
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Redirecting to Lead Upload...</p>
    </div>
  );
};

export default UploadLeads;
