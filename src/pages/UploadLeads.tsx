
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/use-user-role';
import { toast } from 'sonner';
import { usePreventRefresh } from '@/hooks/use-prevent-refresh';

const UploadLeads = () => {
  const navigate = useNavigate();
  const { isLoggedIn, role, isAdmin } = useUserRole();
  
  // Use our custom hook to prevent refreshes
  usePreventRefresh();
  
  useEffect(() => {
    console.log('UploadLeads component - Checking authentication');
    
    // We don't want to navigate immediately to avoid potential race conditions
    const timer = setTimeout(() => {
      if (!isLoggedIn) {
        console.log('UploadLeads - User not logged in, redirecting to login');
        toast.error("Please log in to upload leads");
        navigate('/login', { 
          replace: true,
          state: { 
            returnTo: '/my-leads',
            returnToTab: 'upload'
          }
        });
        return;
      }
      
      if (role !== 'seller' && !isAdmin) {
        console.log(`UploadLeads - User role ${role || 'not set'} not authorized, redirecting to home`);
        toast.error(`Only sellers and admins can upload leads. Your current role is: ${role || 'not set'}`);
        navigate('/', { replace: true });
        return;
      }
      
      console.log('UploadLeads - Authorization passed, navigating to /my-leads with upload tab');
      
      // Navigate to the MyLeads page with the upload tab
      navigate('/my-leads', { 
        replace: true,
        state: { 
          initialTab: 'upload',
          preventTabChange: false,
          source: 'direct-upload-link'
        }
      });
    }, 100);
    
    return () => clearTimeout(timer);
  }, [isLoggedIn, role, navigate, isAdmin]);
  
  // Return a minimal component that won't cause navigation issues
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Preparing upload environment...</p>
    </div>
  );
};

export default UploadLeads;
