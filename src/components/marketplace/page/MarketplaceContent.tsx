
import React from 'react';
import LeadFilters from '@/components/LeadFilters';
import MarketplaceViewSelector, { ViewMode } from '@/components/marketplace/MarketplaceViewSelector';
import MarketplaceStats from '@/components/marketplace/MarketplaceStats';
import MarketplaceLeadsList from '@/components/marketplace/MarketplaceLeadsList';
import { Lead } from '@/types/lead';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';
import { format } from 'date-fns';

interface MarketplaceContentProps {
  filteredLeads: Lead[];
  leadsLoading: boolean;
  handleFilterChange: (filters: any) => void;
  resetFilters: () => void;
  handlePurchaseLead: (lead: Lead) => void;
  lastRefreshed: Date;
  handleRefresh: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const MarketplaceContent: React.FC<MarketplaceContentProps> = ({
  filteredLeads,
  leadsLoading,
  handleFilterChange,
  resetFilters,
  handlePurchaseLead,
  lastRefreshed,
  handleRefresh,
  viewMode,
  onViewModeChange
}) => {
  // Calculate lead statistics
  const totalLeads = filteredLeads.length;
  const availableLeads = filteredLeads.filter(lead => lead.status === 'new').length;
  const soldLeads = filteredLeads.filter(lead => lead.status === 'sold' || lead.status === 'pending').length;

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Lead Marketplace</h1>
          <p className="text-gray-600">Browse available leads from verified sellers</p>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            Last updated: {format(lastRefreshed, 'h:mm:ss a')}
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            className="flex items-center gap-2"
          >
            <RefreshCcw size={16} />
            Refresh Data
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <LeadFilters onFilterChange={handleFilterChange} />
        <MarketplaceViewSelector 
          viewMode={viewMode} 
          onViewModeChange={onViewModeChange}
        />
      </div>
      
      <MarketplaceStats 
        totalLeads={totalLeads}
        availableLeads={availableLeads}
        soldLeads={soldLeads}
      />
      
      <MarketplaceLeadsList 
        leads={filteredLeads}
        isLoading={leadsLoading}
        onPurchase={handlePurchaseLead}
        onResetFilters={resetFilters}
        viewMode={viewMode}
      />
    </>
  );
};

export default MarketplaceContent;
