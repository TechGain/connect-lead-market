
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/use-user-role';
import { toast } from 'sonner';

// Check if we're running inside Lovable iframe
const isInLovableIframe = () => {
  try {
    return window.self !== window.top && window.location.hostname.includes('lovableproject.com');
  } catch (e) {
    return true; // If we can't access parent, we're probably in an iframe
  }
};

const UploadLeads = () => {
  const navigate = useNavigate();
  const { isLoggedIn, role, isAdmin } = useUserRole();
  
  useEffect(() => {
    // Log the current authentication state for debugging
    console.log("UploadLeads component - Current environment:", { 
      isInLovableEnv: isInLovableIframe(),
      isLoggedIn,
      role,
      isAdmin
    });
    
    // Simple redirect to my-leads with upload tab
    if (!isLoggedIn) {
      toast.error("Please log in to upload leads");
      
      if (!isInLovableIframe()) {
        // Only redirect if not in Lovable iframe
        navigate('/login', { replace: true });
      }
      return;
    }
    
    if (role !== 'seller' && !isAdmin) {
      toast.error(`Only sellers and admins can upload leads. Your current role is: ${role || 'not set'}`);
      
      if (!isInLovableIframe()) {
        // Only redirect if not in Lovable iframe
        navigate('/', { replace: true });
      }
      return;
    }
    
    // If in Lovable environment, don't navigate automatically to avoid full page reload issues
    // Instead, show the component content which will then be visible in the iframe
    if (isInLovableIframe()) {
      console.log("In Lovable environment - Not redirecting, displaying upload interface directly");
      return;
    }
    
    // Navigate to my-leads with upload tab - using replace to avoid adding to history stack
    navigate('/my-leads?tab=upload', { replace: true });
  }, [isLoggedIn, role, navigate, isAdmin]);
  
  // In Lovable environment, render the upload component directly instead of redirecting
  if (isInLovableIframe() && isLoggedIn && (role === 'seller' || isAdmin)) {
    // Import and render the UploadLeadTab component directly
    const UploadLeadTab = React.lazy(() => import('@/components/my-leads/UploadLeadTab'));
    
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Upload New Lead</h1>
        <React.Suspense fallback={<div>Loading...</div>}>
          <UploadLeadTab />
        </React.Suspense>
      </div>
    );
  }
  
  // This component doesn't render anything as it's just for redirection in non-Lovable environment
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Redirecting to Lead Upload...</p>
    </div>
  );
};

export default UploadLeads;
