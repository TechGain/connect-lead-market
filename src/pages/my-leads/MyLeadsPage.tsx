
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUserRole } from '@/hooks/use-user-role';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { usePreventRefresh } from '@/hooks/use-prevent-refresh';
import MyLeadsTabs from './MyLeadsTabs';
import { useLeadsAuth } from './hooks/useLeadsAuth';

const MyLeadsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, role, isAdmin, isLoading, user, refreshUserRole } = useUserRole();
  
  // Use our custom hook to prevent refreshes
  usePreventRefresh();
  
  // Extract state safely with fallbacks to avoid issues
  const locationState = location.state || {};
  const initialTabFromState = locationState.initialTab;
  const initialTabFromURL = new URLSearchParams(location.search).get('tab');
  const initialTab = initialTabFromState || initialTabFromURL || 'leads';
  
  console.log("MyLeads initial tab determination:", {
    initialTabFromState,
    initialTabFromURL,
    resultingInitialTab: initialTab,
    locationState
  });
  
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // Use our custom authentication hook
  const { 
    hasChecked, 
    loadingTimeout, 
    handleRefresh 
  } = useLeadsAuth(isLoggedIn, role, isAdmin, isLoading, refreshUserRole, navigate);
  
  // Handle tab change without causing page refresh
  const handleTabChange = (value: string) => {
    console.log("Tab changed to:", value);
    setActiveTab(value);
    
    // Update URL without causing navigation/refresh by directly manipulating history
    const newUrl = `/my-leads?tab=${value}`;
    window.history.replaceState(
      { ...locationState, initialTab: value }, 
      '', 
      newUrl
    );
  };
  
  // Show auth state components based on loading/error states
  if (isLoading && !loadingTimeout) {
    return <MyLeadsTabs.LoadingState onRefresh={handleRefresh} />;
  }
  
  if (loadingTimeout && isLoggedIn) {
    return <MyLeadsTabs.TimeoutState onRefresh={handleRefresh} />;
  }
  
  if (role === null && hasChecked) {
    return <MyLeadsTabs.RoleErrorState onRefresh={handleRefresh} />;
  }
  
  return (
    <div 
      className="flex flex-col min-h-screen"
      onClick={(e) => e.stopPropagation()}
    >
      <Header />
      <main className="flex-1">
        <Tabs 
          value={activeTab} 
          onValueChange={handleTabChange} 
          className="container mx-auto px-4 pt-8"
          onClick={(e) => e.stopPropagation()}
        >
          <TabsList>
            {(role === 'seller' || isAdmin) && (
              <TabsTrigger 
                value="leads"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log("Leads tab clicked");
                }}
              >
                My Leads
              </TabsTrigger>
            )}
            {(role === 'seller' || isAdmin) && (
              <TabsTrigger 
                value="upload"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log("Upload tab clicked");
                }}
              >
                Upload Lead
              </TabsTrigger>
            )}
          </TabsList>
          <TabsContent value="leads" onClick={(e) => e.stopPropagation()}>
            <MyLeadsTabs.LeadsListTab user={user} role={role} isAdmin={isAdmin} />
          </TabsContent>
          <TabsContent value="upload" onClick={(e) => e.stopPropagation()}>
            <MyLeadsTabs.UploadLeadTab />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default MyLeadsPage;
