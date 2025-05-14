
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/use-user-role';
import { toast } from 'sonner';

const UploadLeads = () => {
  const navigate = useNavigate();
  const { isLoggedIn, role, isAdmin } = useUserRole();
  
  useEffect(() => {
    // Log the current authentication state for debugging
    console.log("UploadLeads component - direct navigation to my-leads with upload tab");
    
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
    
    // Navigate directly to /my-leads with upload tab without going through state changes
    window.location.replace('/my-leads?tab=upload');
  }, [isLoggedIn, role, navigate, isAdmin]);
  
  // This component doesn't render anything as it's just for redirection
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Redirecting to Lead Upload...</p>
    </div>
  );
};

export default UploadLeads;
