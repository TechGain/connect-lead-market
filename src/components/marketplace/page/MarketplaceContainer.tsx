
import React from 'react';
import AuthStateDisplay from '@/components/marketplace/AuthStateDisplay';
import MarketplaceContent from './MarketplaceContent';
import LeadPurchaseDialog from '@/components/marketplace/LeadPurchaseDialog';
import ForceShowButton from './ForceShowButton';
import { Lead } from '@/types/lead';
import { ViewMode } from '@/components/marketplace/MarketplaceViewSelector';

interface MarketplaceContainerProps {
  isLoggedIn: boolean;
  canAccessMarketplace: boolean;
  authLoading: boolean;
  authError: string | null;
  role: string | null;
  forceShowContent: boolean;
  leadsLoading: boolean;
  filteredLeads: Lead[];
  lastRefreshed: Date;
  handleRefresh: () => void;
  handleFilterChange: (filters: any) => void;
  resetFilters: () => void;
  handlePurchaseLead: (lead: Lead) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  selectedLead: Lead | null;
  isPreviewDialogOpen: boolean;
  isProcessing: boolean;
  redirectingToStripe: boolean;
  checkoutError: string | null;
  stripeUrl: string | null;
  setIsPreviewDialogOpen: (isOpen: boolean) => void;
  handlePaymentAndCheckout: () => void;
  handleForceShow: () => void;
}

const MarketplaceContainer: React.FC<MarketplaceContainerProps> = ({
  isLoggedIn,
  canAccessMarketplace,
  authLoading,
  authError,
  role,
  forceShowContent,
  leadsLoading,
  filteredLeads,
  lastRefreshed,
  handleRefresh,
  handleFilterChange,
  resetFilters,
  handlePurchaseLead,
  viewMode,
  onViewModeChange,
  selectedLead,
  isPreviewDialogOpen,
  isProcessing,
  redirectingToStripe,
  checkoutError,
  stripeUrl,
  setIsPreviewDialogOpen,
  handlePaymentAndCheckout,
  handleForceShow
}) => {
  return (
    <>
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
      {((isLoggedIn && canAccessMarketplace && !authLoading) || forceShowContent) && leadsLoading && (
        <div className="flex justify-center items-center py-12">
          <p>Loading marketplace data...</p>
        </div>
      )}
      
      {/* Option to bypass auth */}
      {authLoading && !forceShowContent && (
        <ForceShowButton onForceShow={handleForceShow} />
      )}
      
      {/* Show marketplace content when auth passes OR when forced */}
      {((isLoggedIn && canAccessMarketplace && !authLoading) || forceShowContent) && !leadsLoading && (
        <MarketplaceContent 
          filteredLeads={filteredLeads}
          leadsLoading={leadsLoading}
          handleFilterChange={handleFilterChange}
          resetFilters={resetFilters}
          handlePurchaseLead={handlePurchaseLead}
          lastRefreshed={lastRefreshed}
          handleRefresh={handleRefresh}
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
        />
      )}
      
      <LeadPurchaseDialog 
        selectedLead={selectedLead}
        isOpen={isPreviewDialogOpen}
        isProcessing={isProcessing}
        redirectingToStripe={redirectingToStripe}
        checkoutError={checkoutError}
        stripeUrl={stripeUrl}
        onClose={() => setIsPreviewDialogOpen(false)}
        onPurchase={handlePaymentAndCheckout}
      />
    </>
  );
};

export default MarketplaceContainer;
