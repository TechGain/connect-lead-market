
import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuthCheck } from '@/hooks/use-auth-check';
import { useMarketplaceLeads } from '@/hooks/use-marketplace-leads';
import { useLeadCheckout } from '@/hooks/use-lead-checkout';
import { useCheckoutUrlParams } from '@/hooks/use-checkout-url-params';
import { ViewMode } from '@/components/marketplace/MarketplaceViewSelector';
import { toast } from 'sonner';
import MarketplaceContainer from '@/components/marketplace/page/MarketplaceContainer';

const Marketplace = () => {
  const [forceShowContent, setForceShowContent] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('largeCards');
  
  // Use the simplified auth check hook
  const {
    user,
    isLoggedIn,
    role,
    authLoading,
    authChecked,
    authError,
    refreshUserRole
  } = useAuthCheck();
  
  // Leads management with filtering
  const {
    filteredLeads,
    isLoading: leadsLoading,
    handleFilterChange,
    resetFilters,
    refreshLeads,
    lastRefreshed
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
    localStorage.removeItem('supabase.auth.token');
    sessionStorage.removeItem('supabase.auth.token');
    
    // Clean up any Supabase auth items
    Object.keys(localStorage).forEach(key => {
      if (key.includes('supabase') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    
    setForceShowContent(true);
  };
  
  // Function to handle refresh
  const handleRefresh = async () => {
    if (isLoggedIn) {
      await refreshUserRole();
    }
    refreshLeads();
  };

  // Check if user is buyer or admin
  const canAccessMarketplace = role === 'buyer' || role === 'admin';
  
  // Handle view mode change
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    toast.success(`View changed to ${mode} mode`);
  };
  
  // Handle payment and checkout - simplified, no longer needs payment method
  const handlePaymentAndCheckout = () => {
    initiateCheckout();
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <MarketplaceContainer 
          isLoggedIn={isLoggedIn}
          canAccessMarketplace={canAccessMarketplace}
          authLoading={authLoading}
          authError={authError}
          role={role}
          forceShowContent={forceShowContent}
          leadsLoading={leadsLoading}
          filteredLeads={filteredLeads}
          lastRefreshed={lastRefreshed}
          handleRefresh={handleRefresh}
          handleFilterChange={handleFilterChange}
          resetFilters={resetFilters}
          handlePurchaseLead={handlePurchaseLead}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          selectedLead={selectedLead}
          isPreviewDialogOpen={isPreviewDialogOpen}
          isProcessing={isProcessing}
          redirectingToStripe={redirectingToStripe}
          checkoutError={checkoutError}
          stripeUrl={stripeUrl}
          setIsPreviewDialogOpen={setIsPreviewDialogOpen}
          handlePaymentAndCheckout={handlePaymentAndCheckout}
          handleForceShow={handleForceShow}
        />
      </main>
      
      <Footer />
    </div>
  );
};

export default Marketplace;
