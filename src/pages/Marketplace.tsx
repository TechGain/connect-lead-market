
import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LeadFilters from '@/components/LeadFilters';
import { useAuthCheck } from '@/hooks/use-auth-check';
import { useMarketplaceLeads } from '@/hooks/use-marketplace-leads';
import { useLeadCheckout } from '@/hooks/use-lead-checkout';
import { useCheckoutUrlParams } from '@/hooks/use-checkout-url-params';
import MarketplaceHeader from '@/components/marketplace/MarketplaceHeader';
import MarketplaceLeadsList from '@/components/marketplace/MarketplaceLeadsList';
import LeadPurchaseDialog from '@/components/marketplace/LeadPurchaseDialog';
import AuthStateDisplay from '@/components/marketplace/AuthStateDisplay';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const Marketplace = () => {
  const [forceShowContent, setForceShowContent] = useState(false);
  
  // Use the simplified auth check hook
  const {
    user,
    isLoggedIn,
    role,
    authLoading,
    authChecked,
    authError
  } = useAuthCheck();
  
  // Leads management with filtering
  const {
    filteredLeads,
    isLoading: leadsLoading,
    handleFilterChange,
    resetFilters
  } = useMarketplaceLeads(isLoggedIn || forceShowContent, role);
  
  // Lead checkout process
  const {
    selectedLead,
    isPreviewDialogOpen,
    isProcessing,
    redirectingToStripe,
    checkoutError,
    stripeUrl,
    handlePurchaseLead,
    setIsPreviewDialogOpen,
    initiateCheckout,
    handleCompletePurchase
  } = useLeadCheckout(user);
  
  // Handle URL parameters for checkout completion
  useCheckoutUrlParams(authChecked, isLoggedIn, role, handleCompletePurchase);

  // Function to force show content
  const handleForceShow = () => {
    setForceShowContent(true);
    toast.info("Showing marketplace content without authentication");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Auth state display handles loading, errors, and access issues */}
        {!forceShowContent && (
          <AuthStateDisplay 
            isLoading={authLoading} 
            authError={authError}
            isLoggedIn={isLoggedIn}
            role={role}
          />
        )}
        
        {/* Show loader if marketplace data is still loading */}
        {((isLoggedIn && role === 'buyer' && !authLoading) || forceShowContent) && leadsLoading && (
          <div className="flex justify-center items-center py-12">
            <p>Loading marketplace data...</p>
          </div>
        )}
        
        {/* Option to bypass auth */}
        {authLoading && !forceShowContent && (
          <div className="mt-8 text-center">
            <Button variant="outline" onClick={handleForceShow} className="mx-auto">
              Show Content Anyway
            </Button>
          </div>
        )}
        
        {/* Show marketplace content when auth passes OR when forced */}
        {((isLoggedIn && role === 'buyer' && !authLoading) || forceShowContent) && !leadsLoading && (
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
              redirectingToStripe={redirectingToStripe}
              checkoutError={checkoutError}
              stripeUrl={stripeUrl}
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
