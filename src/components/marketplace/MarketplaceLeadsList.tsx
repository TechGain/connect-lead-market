
import React from 'react';
import { Lead } from '@/types/lead';
import { ViewMode } from './MarketplaceViewSelector';
import { 
  LargeCardView, 
  SmallCardView, 
  ListView, 
  CompactTableView 
} from './view-modes';
import { LoadingState, EmptyState } from './states';
import { extractCityFromLocation } from '@/lib/utils';

interface MarketplaceLeadsListProps {
  leads: Lead[];
  isLoading: boolean;
  onPurchase: (lead: Lead) => void;
  onResetFilters: () => void;
  viewMode: ViewMode;
}

const MarketplaceLeadsList: React.FC<MarketplaceLeadsListProps> = ({
  leads,
  isLoading,
  onPurchase,
  onResetFilters,
  viewMode
}) => {
  // Debug information
  console.log('MarketplaceLeadsList: Displaying leads:', leads.length);
  console.log('Lead statuses being displayed:', leads.map(l => l.status).join(', '));
  console.log('Current view mode:', viewMode);
  
  // Debug city extraction for the first few leads
  const DEBUG_CITY_EXTRACTION = false; // Set to true to debug city extraction
  
  if (DEBUG_CITY_EXTRACTION && leads.length > 0) {
    console.log('================= CITY EXTRACTION DEBUG =================');
    leads.slice(0, 5).forEach(lead => {
      const city = extractCityFromLocation(lead.location, lead.zipCode || 'Unknown', true);
      console.log(`Lead location: "${lead.location}" -> City: "${city}"`);
    });
    console.log('=======================================================');
  }

  if (isLoading) {
    return <LoadingState />;
  }

  if (leads.length === 0) {
    return <EmptyState onResetFilters={onResetFilters} />;
  }

  // Render the leads according to the selected view mode
  const renderLeads = () => {
    switch (viewMode) {
      case 'largeCards':
        return <LargeCardView leads={leads} onPurchase={onPurchase} />;
        
      case 'smallCards':
        return <SmallCardView leads={leads} onPurchase={onPurchase} />;
        
      case 'list':
        return <ListView leads={leads} onPurchase={onPurchase} />;
        
      case 'compact':
        return <CompactTableView leads={leads} onPurchase={onPurchase} />;
        
      default:
        return <LargeCardView leads={leads} onPurchase={onPurchase} />;
    }
  };

  return (
    <div className="space-y-6">
      {renderLeads()}
    </div>
  );
};

export default MarketplaceLeadsList;
