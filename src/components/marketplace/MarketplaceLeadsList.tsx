
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
  
  // Uncomment the line below when city extraction debugging is needed
  // console.log('Sample locations:', leads.slice(0, 3).map(l => l.location));

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
