
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUserRole } from '@/hooks/use-user-role';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import LeadUploader from '@/components/LeadUploader';
import LeadTable from '@/components/LeadTable';
import { Lead, mapDbLeadToAppLead } from '@/types/lead';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';

const MyLeads = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isLoggedIn, role, isLoading, user, refreshUserRole } = useUserRole();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'leads');
  const [hasChecked, setHasChecked] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  
  useEffect(() => {
    // Log the current authentication state for debugging
    console.log("MyLeads component - Current auth state:", { 
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
    
    // Check if user is a seller or buyer
    if (role !== 'seller' && role !== 'buyer') {
      console.log("User is not a seller or buyer, redirecting to home", { actualRole: role });
      toast.error(`Only sellers and buyers can view this page. Your current role is: ${role}`);
      navigate('/');
      return;
    }
    
    // Load leads if user is a seller
    if (role === 'seller' && user?.id) {
      loadSellerLeads(user.id);
    }
  }, [isLoggedIn, role, navigate, user?.id, isLoading, hasChecked, loadingTimeout]);
  
  // New function to fetch seller's leads directly from Supabase
  const loadSellerLeads = async (sellerId: string) => {
    try {
      console.log("Loading leads for seller:", sellerId);
      
      const { data: leadsData, error } = await supabase
        .from('leads')
        .select('*')
        .eq('seller_id', sellerId);
        
      if (error) {
        throw error;
      }
      
      console.log("Loaded seller leads:", leadsData?.length);
      
      // Map database leads to app format
      const sellerLeads = leadsData.map(mapDbLeadToAppLead);
      setLeads(sellerLeads);
    } catch (error) {
      console.error("Error loading leads:", error);
      toast.error("Failed to load leads. Please try again.");
    }
  };
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`/my-leads?tab=${value}`);
  };
  
  const handleRefresh = () => {
    refreshUserRole();
    toast.info("Refreshing user role...");
    setLoadingTimeout(false);
    setHasChecked(false);
  };
  
  const renderLeadsTab = () => (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">My Leads</h1>
      {role === 'seller' ? (
        <LeadTable leads={leads} />
      ) : (
        <p>Only sellers can view their leads here.</p>
      )}
    </div>
  );
  
  const renderUploadTab = () => (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Upload New Lead</h1>
      <LeadUploader />
    </div>
  );
  
  // Show a loading state with a timeout message
  if (isLoading && !loadingTimeout) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
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
        <Footer />
      </div>
    );
  }
  
  // If loading has timed out but we're logged in, show a UI that allows manual refresh
  if (loadingTimeout && isLoggedIn) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
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
            <Button variant="outline" onClick={() => navigate('/my-leads?tab=leads')}>
              Continue Anyway
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  // If role is null after timeout, show an error message
  if (role === null && hasChecked) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-screen">
          <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
          <p className="text-lg font-medium mb-2">Unable to Determine Role</p>
          <p className="text-sm text-gray-500 mb-6 max-w-md text-center">
            We were unable to determine your role. Please try logging out and logging back in. If the issue persists, contact support.
          </p>
          <Button onClick={handleRefresh} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="container mx-auto px-4 pt-8">
          <TabsList>
            {role === 'seller' && (
              <TabsTrigger value="leads">My Leads</TabsTrigger>
            )}
            {role === 'seller' && (
              <TabsTrigger value="upload">Upload Lead</TabsTrigger>
            )}
          </TabsList>
          <TabsContent value="leads">
            {renderLeadsTab()}
          </TabsContent>
          <TabsContent value="upload">
            {renderUploadTab()}
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default MyLeads;
