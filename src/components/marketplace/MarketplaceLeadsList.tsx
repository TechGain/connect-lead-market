
import React from 'react';
import { Lead } from '@/types/lead';
import { ViewMode } from '@/components/marketplace/MarketplaceViewSelector';
import { LargeCardView, SmallCardView, ListView, CompactTableView } from '@/components/marketplace/view-modes';

interface MarketplaceLeadsListProps {
  leads: Lead[];
  viewMode: ViewMode;
  showFullDetails: boolean;
  onPurchase: (lead: Lead) => void;
  isLoading?: boolean;
  onResetFilters: () => void;
}

const MarketplaceLeadsList: React.FC<MarketplaceLeadsListProps> = ({
  leads,
  viewMode,
  showFullDetails,
  onPurchase,
  isLoading = false,
  onResetFilters
}) => {
  if (isLoading) {
    return <p>Loading leads...</p>;
  }

  if (!leads || leads.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">No leads available in the marketplace.</p>
        <button 
          onClick={onResetFilters}
          className="text-blue-600 hover:text-blue-800 underline"
        >
          Reset filters
        </button>
      </div>
    );
  }

  // Render different view modes using dedicated components
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

export default MarketplaceLeadsList;
