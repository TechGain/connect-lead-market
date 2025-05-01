
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/use-user-role';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';

const UploadLeads = () => {
  const navigate = useNavigate();
  const { isLoggedIn, role, isLoading, user, refreshUserRole } = useUserRole();
  const [hasChecked, setHasChecked] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  
  useEffect(() => {
    // Log the current authentication state for debugging
    console.log("UploadLeads component - Current auth state:", { 
      isLoggedIn, 
      role,
      isLoading,
      userId: user?.id,
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
      toast.error("Please log in to upload leads");
      navigate('/login');
      return;
    }
    
    // If role is null but user is logged in, proceed with a fallback approach
    if (role === null && isLoggedIn) {
      console.log("User role is null but user is logged in");
      // We'll let the my-leads page handle the role check with a fallback UI
      navigate('/my-leads?tab=upload');
      return;
    }
    
    // Check if user is a seller
    if (role !== 'seller') {
      console.log("User is not a seller, redirecting to home", { actualRole: role });
      toast.error(`Only sellers can upload leads. Your current role is: ${role || 'not set'}`);
      navigate('/');
      return;
    }
    
    // Redirect to my-leads with upload tab active if all checks pass
    console.log("User is a seller, redirecting to upload tab");
    navigate('/my-leads?tab=upload');
  }, [isLoggedIn, role, navigate, isLoading, user?.id, hasChecked, loadingTimeout]);
  
  const handleRefresh = () => {
    refreshUserRole();
    toast.info("Refreshing user role...");
    setLoadingTimeout(false);
    setHasChecked(false);
  };
  
  // Show a loading state with a timeout message
  if (isLoading && !loadingTimeout) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="mb-2">Checking permissions...</p>
        <p className="text-sm text-gray-500 mb-4">
          If this takes too long, try refreshing the page
        </p>
        <Button variant="outline" onClick={handleRefresh} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>
    );
  }
  
  // If loading has timed out but we're logged in, show a UI that allows manual refresh
  if (loadingTimeout && isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-lg font-medium mb-2">Permission Check Timed Out</p>
        <p className="text-sm text-gray-500 mb-6 max-w-md text-center">
          We couldn't determine your account role. You can try manually refreshing or continue to My Leads.
        </p>
        <div className="flex gap-4">
          <Button onClick={handleRefresh} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" onClick={() => navigate('/my-leads?tab=upload')}>
            Continue Anyway
          </Button>
        </div>
      </div>
    );
  }
  
  // This component doesn't render anything else as it's just for redirection
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Redirecting...</p>
    </div>
  );
};

export default UploadLeads;
