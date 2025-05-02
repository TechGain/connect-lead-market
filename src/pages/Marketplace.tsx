
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LeadFilters from '@/components/LeadFilters';
import { useUserRole } from '@/hooks/use-user-role';
import { useMarketplaceLeads } from '@/hooks/use-marketplace-leads';
import { useLeadCheckout } from '@/hooks/use-lead-checkout';
import { useCheckoutUrlParams } from '@/hooks/use-checkout-url-params';
import MarketplaceHeader from '@/components/marketplace/MarketplaceHeader';
import MarketplaceLeadsList from '@/components/marketplace/MarketplaceLeadsList';
import LeadPurchaseDialog from '@/components/marketplace/LeadPurchaseDialog';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Marketplace = () => {
  const navigate = useNavigate();
  const [forceShowContent, setForceShowContent] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  
  // Auth state management
  const {
    user,
    isLoggedIn,
    role,
    isLoading: authLoading,
    refreshUserRole
  } = useUserRole();
  
  // Set a timeout to avoid indefinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (authLoading) {
        console.log("Auth check timeout reached, enabling force show option");
        setLoadingTimeout(true);
      }
    }, 3000); // 3 seconds timeout
    
    return () => clearTimeout(timer);
  }, [authLoading]);
  
  useEffect(() => {
    console.log('Marketplace render - Auth state:', {
      authLoading,
      isLoggedIn,
      role,
      forceShowContent,
      loadingTimeout
    });
  }, [authLoading, isLoggedIn, role, forceShowContent, loadingTimeout]);
  
  // Leads management with filtering
  const {
    filteredLeads,
    isLoading: leadsLoading,
    handleFilterChange,
    resetFilters
  } = useMarketplaceLeads(isLoggedIn, role);
  
  // Lead checkout process
  const {
    selectedLead,
    isPreviewDialogOpen,
    isProcessing,
    handlePurchaseLead,
    setIsPreviewDialogOpen,
    initiateCheckout,
    handleCompletePurchase
  } = useLeadCheckout(user);
  
  // Handle URL params after checkout
  useCheckoutUrlParams(handleCompletePurchase);

  // Function to handle refreshing auth
  const handleRefresh = () => {
    refreshUserRole();
    toast.info("Refreshing user role...");
    setLoadingTimeout(false);
  };

  // Function to force show content
  const handleForceShow = () => {
    setForceShowContent(true);
    toast.info("Showing content without auth check");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Loading state */}
        {authLoading && !forceShowContent && !loadingTimeout && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p className="mb-2">Verifying your account...</p>
            <p className="text-sm text-gray-500">This should only take a moment</p>
          </div>
        )}
        
        {/* Auth timeout message */}
        {loadingTimeout && !forceShowContent && (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-lg font-medium mb-2">Authentication is taking longer than expected</p>
            <p className="text-sm text-gray-500 mb-6 max-w-md text-center">
              You can try refreshing your session or continue to view the marketplace anyway.
            </p>
            <div className="flex gap-4">
              <Button onClick={handleRefresh} className="flex items-center gap-2">
                <span>Refresh Session</span>
              </Button>
              <Button variant="outline" onClick={handleForceShow}>
                Continue Anyway
              </Button>
            </div>
          </div>
        )}
        
        {/* Auth error message */}
        {!authLoading && !isLoggedIn && !forceShowContent && (
          <div className="flex flex-col items-center justify-center py-16">
            <h1 className="text-3xl font-bold mb-4">Access Restricted</h1>
            <p className="text-gray-600 mb-6">
              Please log in to access the marketplace.
            </p>
            <Button onClick={() => navigate('/login')}>
              Log In
            </Button>
          </div>
        )}
        
        {/* Wrong role message */}
        {!authLoading && isLoggedIn && role !== 'buyer' && !forceShowContent && (
          <div className="flex flex-col items-center justify-center py-16">
            <h1 className="text-3xl font-bold mb-4">Access Restricted</h1>
            <p className="text-gray-600 mb-6">
              The marketplace is only available to buyers. Your current role: {role || 'not set'}
            </p>
            <Button onClick={() => navigate('/')}>
              Return to Home
            </Button>
          </div>
        )}
        
        {/* Show marketplace content when auth passes OR when forced */}
        {((isLoggedIn && role === 'buyer' && !authLoading) || forceShowContent) && (
          <>
            <MarketplaceHeader 
              title="Lead Marketplace" 
              description="Browse available leads from verified sellers" 
            />
            
            <LeadFilters onFilterChange={handleFilterChange} />
            
            <MarketplaceLeadsList 
              leads={filteredLeads}
              isLoading={leadsLoading}
              onPurchase={handlePurchaseLead}
              onResetFilters={resetFilters}
            />
            
            <LeadPurchaseDialog 
              selectedLead={selectedLead}
              isOpen={isPreviewDialogOpen}
              isProcessing={isProcessing}
              onClose={() => setIsPreviewDialogOpen(false)}
              onPurchase={initiateCheckout}
            />
          </>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Marketplace;
