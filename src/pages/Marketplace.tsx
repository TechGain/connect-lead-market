
import React from 'react';
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

const Marketplace = () => {
  // Auth state management
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
    isLoading,
    handleFilterChange,
    resetFilters
  } = useMarketplaceLeads(authChecked, authError, isLoggedIn, role);
  
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
  useCheckoutUrlParams(authChecked, isLoggedIn, role, handleCompletePurchase);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Show auth state components for loading/error/access-restricted states */}
        <AuthStateDisplay 
          isLoading={authLoading} 
          authError={authError}
          isLoggedIn={isLoggedIn}
          role={role}
        />
        
        {/* Show marketplace content only if authenticated as buyer */}
        {authChecked && isLoggedIn && role === 'buyer' && (
          <>
            <MarketplaceHeader 
              title="Lead Marketplace" 
              description="Browse available leads from verified sellers" 
            />
            
            <LeadFilters onFilterChange={handleFilterChange} />
            
            <MarketplaceLeadsList 
              leads={filteredLeads}
              isLoading={isLoading}
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
