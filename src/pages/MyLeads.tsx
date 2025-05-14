
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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

const MyLeads = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, role, isAdmin, isLoading, user, refreshUserRole } = useUserRole();
  const [hasChecked, setHasChecked] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  
  // Get initial tab from location state if available, or from URL
  const initialTabFromState = location.state?.initialTab;
  const initialTabFromURL = new URLSearchParams(location.search).get('tab');
  const initialTab = initialTabFromState || initialTabFromURL || 'leads';
  
  console.log("MyLeads initial tab determination:", {
    initialTabFromState,
    initialTabFromURL,
    resultingInitialTab: initialTab
  });
  
  const [activeTab, setActiveTab] = useState(initialTab);
  
  const { leads } = useSellerLeads(user?.id);
  
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
      locationState: location.state
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
      navigate('/login');
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
      navigate('/');
      return;
    }
    
    // Set tab from URL parameter or location state on initial load
    if (location.state?.initialTab && !location.state?.preventTabChange) {
      console.log("Setting active tab from state:", location.state.initialTab);
      setActiveTab(location.state.initialTab);
      
      // Clean up the state so future navigations don't override user tab selection
      const newState = {...location.state};
      delete newState.initialTab;
      navigate(location.pathname + location.search, { 
        replace: true, 
        state: newState 
      });
    }
    else if (initialTabFromURL && !location.state?.preventTabChange) {
      console.log("Setting active tab from URL parameter:", initialTabFromURL);
      setActiveTab(initialTabFromURL);
    }
    
  }, [isLoggedIn, role, navigate, user?.id, isAdmin, isLoading, hasChecked, loadingTimeout, location, initialTabFromURL]);
  
  // Fix: Ensure tab change doesn't cause page refresh
  const handleTabChange = (value: string) => {
    console.log("Tab changed to:", value);
    setActiveTab(value);
    
    // Update URL without causing navigation/refresh
    // Use history.replaceState directly to avoid potential refresh issues in iframe
    if (value !== activeTab) {
      const newUrl = `/my-leads?tab=${value}`;
      window.history.replaceState(
        { ...window.history.state, preventTabChange: true }, 
        '', 
        newUrl
      );
    }
  };
  
  const handleRefresh = () => {
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
        <Tabs 
          value={activeTab} 
          onValueChange={handleTabChange} 
          className="container mx-auto px-4 pt-8"
        >
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
