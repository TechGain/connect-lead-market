import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LeadCard from '@/components/LeadCard';
import LeadUploader from '@/components/LeadUploader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from "sonner";
import { Lead } from '@/types/lead';
import { fetchLeadsBySeller, createLead } from '@/lib/mock-data';
import { useUserRole } from '@/hooks/use-user-role';
import { useNavigate, useLocation } from 'react-router-dom';
import { AlertCircle, FileUp, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const MyLeads = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, role, user, refreshUserRole } = useUserRole();
  const [myLeads, setMyLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roleChecked, setRoleChecked] = useState(false);
  
  // Get tab from URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const tabFromUrl = queryParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl === 'upload' ? 'upload' : 'active');
  
  // Debug log to track role and login state
  useEffect(() => {
    console.log("MyLeads component - Current auth state:", { 
      isLoggedIn, 
      role,
      userId: user?.id,
      activeTab,
      roleChecked
    });

    // Direct database check for debugging role issues
    const checkProfileDirectly = async () => {
      if (user?.id && !role) {
        try {
          console.log("Performing direct database check for user profile");
          const { data, error } = await supabase
            .from('profiles')
            .select('id, role, full_name')
            .eq('id', user.id)
            .maybeSingle();
            
          if (error) {
            console.error("Error in direct profile check:", error);
          } else {
            console.log("Direct profile check result:", data);
            
            if (!data) {
              console.warn("No profile found during direct check");
              
              // If we're logged in but have no profile, attempt to create one
              if (!roleChecked) {
                console.log("Attempting profile repair from MyLeads component");
                refreshUserRole();
                setRoleChecked(true);
              }
            }
          }
        } catch (err) {
          console.error("Exception during direct profile check:", err);
        }
      }
    };
    
    checkProfileDirectly();
  }, [isLoggedIn, role, user?.id, activeTab, roleChecked, refreshUserRole]);
  
  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    console.log("Changing tab to:", value);
    setActiveTab(value);
    if (value === 'upload') {
      navigate('/my-leads?tab=upload', { replace: true });
    } else {
      navigate('/my-leads', { replace: true });
    }
  };
  
  // Refresh user role and data with more robust handling
  const handleRefresh = () => {
    setRoleChecked(false); // Reset check to allow another attempt
    refreshUserRole();
    
    // Short delay before reloading leads to give role refresh time to complete
    setTimeout(() => {
      loadSellerLeads();
      toast.info("Refreshing data...");
    }, 1500);
  };
  
  const loadSellerLeads = async () => {
    setIsLoading(true);
    try {
      if (user?.id) {
        const leads = await fetchLeadsBySeller(user.id);
        setMyLeads(leads);
      }
    } catch (error) {
      console.error('Error loading seller leads:', error);
      toast.error('Failed to load your leads');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (!isLoggedIn) {
      toast.error("You must be logged in as a seller to view this page");
      navigate('/login');
      return;
    }
    
    // Allow access if logged in, even if role is null (with warning)
    if (role !== 'seller' && role !== null) {
      toast.error("Only sellers can access this page");
      navigate('/');
      return;
    }
    
    if (user?.id) {
      loadSellerLeads();
    }
  }, [isLoggedIn, role, navigate, user?.id]);
  
  const handleLeadSubmit = async (leadData: Omit<Lead, 'id'>) => {
    try {
      if (!user?.id) {
        toast.error("You must be logged in to upload leads");
        return;
      }
      
      const leadWithSellerId = {
        ...leadData,
        sellerId: user.id,
      };
      
      const newLead = await createLead(leadWithSellerId);
      
      if (newLead) {
        setMyLeads([newLead, ...myLeads]);
        setActiveTab('active');
        navigate('/my-leads', { replace: true });
        toast.success("Lead uploaded successfully!");
      }
    } catch (error) {
      console.error('Error uploading lead:', error);
      toast.error('Failed to upload lead');
    }
  };
  
  const getFilteredLeads = () => {
    switch (activeTab) {
      case 'active':
        return myLeads.filter(lead => lead.status === 'new' || lead.status === 'pending');
      case 'sold':
        return myLeads.filter(lead => lead.status === 'sold');
      case 'upload':
        return [];
      default:
        return myLeads;
    }
  };
  
  const handlePurchase = () => {
    // This is just a placeholder since sellers shouldn't purchase their own leads
    toast.error("You can't purchase your own leads");
  };
  
  const filteredLeads = getFilteredLeads();
  const activeLeadsCount = myLeads.filter(lead => lead.status === 'new' || lead.status === 'pending').length;
  const soldLeadsCount = myLeads.filter(lead => lead.status === 'sold').length;

  // If not logged in, show a clear message
  if (!isLoggedIn) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center p-8 rounded-lg border border-gray-200 shadow-sm max-w-md w-full">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Access Restricted</h2>
            <p className="text-gray-600 mb-6">
              You must be logged in as a seller to access this page.
            </p>
            <div className="space-x-4">
              <Button onClick={() => navigate('/login')}>Log In</Button>
              <Button variant="outline" onClick={() => navigate('/')}>Go Home</Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // If role is null but user is logged in, show a warning banner
  const showRoleWarning = role === null && isLoggedIn;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      {(role === null) && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md flex justify-between items-center">
          <div>
            <h3 className="font-medium text-yellow-800">Account role not detected</h3>
            <p className="text-yellow-700 text-sm">Some features may be limited. Please refresh to verify your seller status.</p>
          </div>
          <Button 
            onClick={handleRefresh}
            variant="outline" 
            className="flex items-center gap-2 bg-white hover:bg-white"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      )}
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Leads</h1>
            <p className="text-gray-600">
              Manage your leads and track their status
            </p>
          </div>
          
          {/* Quick access button for uploading new leads */}
          <Button 
            onClick={() => handleTabChange('upload')}
            className="mt-4 md:mt-0 bg-brand-500 hover:bg-brand-600"
          >
            <FileUp className="mr-2 h-4 w-4" />
            Upload New Lead
          </Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="active" className="relative">
              Active Leads
              {activeLeadsCount > 0 && (
                <Badge className="ml-2 bg-brand-500">{activeLeadsCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sold" className="relative">
              Sold Leads
              {soldLeadsCount > 0 && (
                <Badge className="ml-2 bg-green-500">{soldLeadsCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="upload" className="relative">
              Upload New Lead
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="active">
            {isLoading ? (
              <div className="text-center py-12">
                <p>Loading your leads...</p>
              </div>
            ) : filteredLeads.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLeads.map(lead => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    onPurchase={handlePurchase}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold mb-2">No Active Leads</h3>
                <p className="text-gray-600 mb-4">You don't have any active leads right now</p>
                <Button onClick={() => handleTabChange('upload')}>Upload New Lead</Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="sold">
            {isLoading ? (
              <div className="text-center py-12">
                <p>Loading your leads...</p>
              </div>
            ) : filteredLeads.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLeads.map(lead => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    onPurchase={handlePurchase}
                    isPurchased={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold mb-2">No Sold Leads</h3>
                <p className="text-gray-600 mb-4">You haven't sold any leads yet</p>
                <Button onClick={() => handleTabChange('upload')}>Upload New Lead</Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="upload">
            <LeadUploader onLeadSubmit={handleLeadSubmit} />
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default MyLeads;
