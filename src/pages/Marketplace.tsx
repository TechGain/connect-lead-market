import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LeadCard from '@/components/LeadCard';
import LeadFilters from '@/components/LeadFilters';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from "sonner";
import { Lead } from '@/types/lead';
import { fetchLeads } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/utils';
import { useUserRole } from '@/hooks/use-user-role';
import { supabase } from '@/integrations/supabase/client';

const Marketplace = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn, role, isLoading: authLoading } = useUserRole();
  
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Check authentication and role first - with improved error handling
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!authLoading) {
          console.log('Auth loading completed, checking auth status:', { isLoggedIn, role });
          setAuthChecked(true);
          
          if (!isLoggedIn) {
            console.log('User not logged in, redirecting to login');
            toast.error("Please log in to access the marketplace");
            navigate('/login');
            return;
          }

          if (role !== 'buyer') {
            console.log('Access denied: User role is', role);
            setAuthError(`Only buyers can access the marketplace. Your role: ${role || 'not set'}`);
            return;
          }
          
          // Clear any previous auth errors if we got here successfully
          setAuthError(null);
        }
      } catch (error) {
        console.error('Error in auth checking:', error);
        setAuthError('Error verifying your account. Please try refreshing the page.');
        setAuthChecked(true); // Still mark as checked so we can show error UI
      }
    };
    
    checkAuth();
  }, [isLoggedIn, role, authLoading, navigate]);

  // Load leads once auth check is complete and user is authorized
  useEffect(() => {
    const loadLeads = async () => {
      if (!authChecked) return; // Don't attempt to load until auth is checked
      if (authError) return; // Don't attempt to load if there's an auth error
      if (!isLoggedIn || role !== 'buyer') return; // Don't attempt to load if user isn't authorized
      
      setIsLoading(true);
      try {
        console.log('Loading marketplace leads...');
        const leadsData = await fetchLeads();
        // Only show available leads (not sold)
        const availableLeads = leadsData.filter(lead => lead.status !== 'sold');
        setLeads(availableLeads);
        setFilteredLeads(availableLeads);
        console.log('Loaded leads:', availableLeads.length);
      } catch (error) {
        console.error('Error loading marketplace leads:', error);
        toast.error('Failed to load marketplace leads');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadLeads();
  }, [authChecked, authError, isLoggedIn, role]);

  // Check URL parameters for successful purchase
  useEffect(() => {
    if (!authChecked || !isLoggedIn || role !== 'buyer') return;
    
    const queryParams = new URLSearchParams(window.location.search);
    const success = queryParams.get('success');
    const canceled = queryParams.get('canceled');
    const leadId = queryParams.get('lead_id');

    if (success === 'true' && leadId) {
      // Complete the lead purchase after successful payment
      handleCompletePurchase(leadId);
    } else if (canceled === 'true') {
      toast.error('Payment was canceled');
    }

    // Clear URL parameters
    if (success || canceled) {
      navigate('/marketplace', { replace: true });
    }
  }, [authChecked, isLoggedIn, role, navigate]);

  const handleCompletePurchase = async (leadId: string) => {
    try {
      setIsProcessing(true);
      
      const { data, error } = await supabase.functions.invoke('complete-lead-purchase', {
        body: { leadId }
      });

      if (error) throw new Error(error.message);
      if (!data.success) throw new Error(data.error || 'Failed to complete purchase');
      
      toast.success('Lead purchased successfully!');
      navigate('/purchases');
    } catch (error) {
      console.error('Error completing purchase:', error);
      toast.error('Failed to complete the purchase. Please contact support.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleFilterChange = (filters: any) => {
    let filtered = [...leads];
    
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(lead => 
        lead.type.toLowerCase().includes(searchTerm) ||
        lead.location.toLowerCase().includes(searchTerm) ||
        lead.description.toLowerCase().includes(searchTerm)
      );
    }
    
    if (filters.type) {
      filtered = filtered.filter(lead => 
        lead.type.toLowerCase() === filters.type.toLowerCase()
      );
    }
    
    if (filters.location) {
      filtered = filtered.filter(lead => 
        lead.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    
    filtered = filtered.filter(lead => 
      lead.price >= filters.minPrice && 
      lead.price <= filters.maxPrice
    );
    
    if (filters.minRating > 0) {
      filtered = filtered.filter(lead => lead.qualityRating >= filters.minRating);
    }
    
    setFilteredLeads(filtered);
  };
  
  const handlePurchaseLead = (lead: Lead) => {
    if (!isLoggedIn) {
      toast.error("Please log in to purchase leads");
      navigate('/login');
      return;
    }
    
    if (role !== 'buyer') {
      toast.error("Only buyers can purchase leads");
      return;
    }
    
    setSelectedLead(lead);
    setIsPreviewDialogOpen(true);
  };
  
  const initiateCheckout = async () => {
    if (!selectedLead || !user) return;
    
    try {
      setIsProcessing(true);
      
      const { data, error } = await supabase.functions.invoke('create-lead-checkout', {
        body: { leadId: selectedLead.id }
      });
      
      if (error) throw new Error(error.message);
      if (!data.success) throw new Error(data.error || 'Failed to create checkout session');
      
      // Close the dialog
      setIsPreviewDialogOpen(false);
      
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error) {
      console.error('Error initiating checkout:', error);
      toast.error('Failed to initiate checkout');
      setIsProcessing(false);
    }
  };

  // Shows loading state while checking authentication
  if (authLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 container mx-auto px-4 flex items-center justify-center py-12">
          <div className="text-center">
            <p className="mb-2 text-lg">Checking your account...</p>
            <p className="text-sm text-gray-500">Please wait while we verify your credentials</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // If there was an authentication error
  if (authChecked && authError) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Authentication Error</h1>
          <p className="text-gray-600 mb-6">{authError}</p>
          <div className="space-x-4">
            <Button onClick={() => navigate('/')}>
              Return to Home
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // If role is not buyer, show access restricted message
  if (authChecked && (!isLoggedIn || role !== 'buyer')) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Access Restricted</h1>
          <p className="text-gray-600 mb-6">
            The marketplace is only available to buyers. Please switch to a buyer account to access this page.
          </p>
          <Button onClick={() => navigate('/')}>
            Return to Home
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Lead Marketplace</h1>
          <p className="text-gray-600">
            Browse available leads from verified sellers
          </p>
        </div>
        
        <LeadFilters onFilterChange={handleFilterChange} />
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <p>Loading leads...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLeads.length > 0 ? (
              filteredLeads.map(lead => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  onPurchase={handlePurchaseLead}
                />
              ))
            ) : (
              <div className="col-span-3 py-12 text-center">
                <h3 className="text-xl font-semibold mb-2">No leads match your filters</h3>
                <p className="text-gray-600 mb-4">Try adjusting your search criteria</p>
                <Button 
                  onClick={() => handleFilterChange({
                    search: '',
                    type: '',
                    location: '',
                    minPrice: 0,
                    maxPrice: 500,
                    minRating: 0,
                  })}
                  variant="outline"
                >
                  Reset Filters
                </Button>
              </div>
            )}
          </div>
        )}
        
        <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Confirm Lead Purchase</DialogTitle>
              <DialogDescription>
                You're about to purchase this lead. Once confirmed, you'll get full access to the contact information.
              </DialogDescription>
            </DialogHeader>
            
            {selectedLead && (
              <div className="py-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-medium text-lg">{selectedLead.type}</h3>
                    <p className="text-gray-500">{selectedLead.location}</p>
                  </div>
                  
                  <p className="text-gray-700">{selectedLead.description}</p>
                  
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Lead Price:</span>
                      <span className="font-semibold">{formatCurrency(selectedLead.price)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Quality Rating:</span>
                      <span>{selectedLead.qualityRating} / 5</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsPreviewDialogOpen(false)}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button 
                onClick={initiateCheckout}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : `Purchase for ${selectedLead ? formatCurrency(selectedLead.price) : '$0.00'}`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
      
      <Footer />
    </div>
  );
};

export default Marketplace;
