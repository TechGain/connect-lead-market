
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
import { extractCityFromLocation } from '@/lib/utils/location/cityExtractor';

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
  
  // Enhanced city extraction debugging
  const CITY_EXTRACTION_DEBUG = true; // Enable city extraction debug by default
  
  if (CITY_EXTRACTION_DEBUG && leads.length > 0) {
    console.group('========== CITY EXTRACTION RESULTS ==========');
    leads.slice(0, 10).forEach(lead => {
      const cityResult = extractCityFromLocation(lead.location, lead.zipCode || 'N/A', true);
      console.log(`Location: "${lead.location || 'N/A'}" | ZIP: "${lead.zipCode || 'N/A'}" | Result: "${cityResult}"`);
    });
    console.groupEnd();
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
