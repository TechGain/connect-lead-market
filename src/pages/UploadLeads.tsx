
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/use-user-role';
import { toast } from 'sonner';

const UploadLeads = () => {
  const navigate = useNavigate();
  const { isLoggedIn, role } = useUserRole();
  
  useEffect(() => {
    // Check if user is logged in and is a seller
    if (!isLoggedIn) {
      toast.error("Please log in to upload leads");
      navigate('/login');
      return;
    }
    
    if (role !== 'seller') {
      toast.error("Only sellers can upload leads");
      navigate('/');
      return;
    }
    
    // Redirect to my-leads with upload tab active
    navigate('/my-leads?tab=upload');
  }, [isLoggedIn, role, navigate]);
  
  // This component doesn't render anything as it's just for redirection
  return null;
};

export default UploadLeads;
