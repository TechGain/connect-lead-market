
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useUserRole } from '@/hooks/use-user-role';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useSellerLeads } from '@/hooks/use-seller-leads';
import LoadingState from '@/components/my-leads/LoadingState';
import TimeoutState from '@/components/my-leads/TimeoutState';
import RoleErrorState from '@/components/my-leads/RoleErrorState';
import LeadsListTab from '@/components/my-leads/LeadsListTab';
import UploadLeadTab from '@/components/my-leads/UploadLeadTab';

// Check if we're running inside Lovable iframe
const isInLovableIframe = () => {
  try {
    return window.self !== window.top && window.location.hostname.includes('lovableproject.com');
  } catch (e) {
    return true; // If we can't access parent, we're probably in an iframe
  }
};

const MyLeads = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { isLoggedIn, role, isAdmin, isLoading, user, refreshUserRole } = useUserRole();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'leads');
  const [hasChecked, setHasChecked] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  
  const { leads } = useSellerLeads(user?.id);

  // Prevent default behavior for links and forms in Lovable environment
  useEffect(() => {
    if (isInLovableIframe()) {
      console.log("MyLeads component - Running in Lovable environment, adding event preventions");
      
      const preventDefaultForEvent = (e: Event) => {
        if (e.target && (e.target as HTMLElement).tagName === 'FORM') {
          console.log("Preventing form submission default behavior in Lovable");
          e.preventDefault();
          e.stopPropagation();
        }
      };

      document.addEventListener('submit', preventDefaultForEvent, true);
      
      return () => {
        document.removeEventListener('submit', preventDefaultForEvent, true);
      };
    }
  }, []);
  
  useEffect(() => {
    // Log the current authentication state for debugging
    console.log("MyLeads component - Current auth state:", { 
      isLoggedIn, 
      role,
      isAdmin,
      isLoading,
      userId: user?.id,
      hasChecked,
      loadingTimeout,
      activeTab,
      currentPath: location.pathname + location.search,
      isInLovableEnv: isInLovableIframe()
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
      
      if (!isInLovableIframe()) {
        // Only redirect if not in Lovable iframe
        navigate('/login');
      }
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
      
      if (!isInLovableIframe()) {
        // Only redirect if not in Lovable iframe
        navigate('/');
      }
      return;
    }
    
    // Set active tab based on URL parameter
    const tabParam = searchParams.get('tab');
    if (tabParam && (tabParam === 'leads' || tabParam === 'upload')) {
      setActiveTab(tabParam);
    }
    
  }, [isLoggedIn, role, navigate, user?.id, isAdmin, isLoading, hasChecked, loadingTimeout, searchParams, location]);
  
  const handleTabChange = (value: string) => {
    console.log("Tab changed to:", value);
    setActiveTab(value);
    
    // Update URL without causing a full page reload - use replace: true
    // In Lovable environment, don't use navigate as it might cause issues
    if (!isInLovableIframe()) {
      const newUrl = `/my-leads?tab=${value}`;
      navigate(newUrl, { replace: true });
    }
  };
  
  const handleRefresh = (e: React.MouseEvent) => {
    // Prevent default browser behavior
    e.preventDefault();
    
    refreshUserRole();
    toast.info("Refreshing user role...");
    setLoadingTimeout(false);
    setHasChecked(false);
  };
  
  // Show a loading state with a timeout message
  if (isLoading && !loadingTimeout) {
    return <LoadingState onRefresh={handleRefresh} />;
  }
  
  // If loading has timed out but we're logged in, show a UI that allows manual refresh
  if (loadingTimeout && isLoggedIn) {
    return <TimeoutState onRefresh={handleRefresh} />;
  }
  
  // If role is null after timeout, show an error message
  if (role === null && hasChecked) {
    return <RoleErrorState onRefresh={handleRefresh} />;
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="container mx-auto px-4 pt-8">
          <TabsList>
            {(role === 'seller' || isAdmin) && (
              <TabsTrigger value="leads">My Leads</TabsTrigger>
            )}
            {(role === 'seller' || isAdmin) && (
              <TabsTrigger value="upload">Upload Lead</TabsTrigger>
            )}
          </TabsList>
          <TabsContent value="leads">
            <LeadsListTab leads={leads} role={role} isAdmin={isAdmin} />
          </TabsContent>
          <TabsContent value="upload">
            <UploadLeadTab />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default MyLeads;
