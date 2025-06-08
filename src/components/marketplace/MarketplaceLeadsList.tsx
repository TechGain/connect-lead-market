import React from 'react';
import { Lead } from '@/types/lead';
import LeadCard from '@/components/LeadCard';
import { extractCityFromLocation } from '@/lib/utils';

interface MarketplaceLeadsListProps {
  leads: Lead[];
  viewMode: 'large-cards' | 'small-cards' | 'list' | 'compact-table';
  showFullDetails: boolean;
  onPurchase: (lead: Lead) => void;
  isLoading?: boolean;
}

const MarketplaceLeadsList: React.FC<MarketplaceLeadsListProps> = ({
  leads,
  viewMode,
  showFullDetails,
  onPurchase,
  isLoading = false
}) => {
  if (isLoading) {
    return <p>Loading leads...</p>;
  }

  if (!leads || leads.length === 0) {
    return <p>No leads available in the marketplace.</p>;
  }

  const renderLeadCard = (lead: Lead) => {
    return (
      <LeadCard
        key={lead.id}
        lead={lead}
        viewMode={viewMode}
        showFullDetails={showFullDetails}
        isMarketplace={true}
        onPurchase={onPurchase}
        cityDisplay={getCityForLead(lead)}
      />
    );
  };

  // Fix the city extraction call - pass the address as fallback string instead of boolean
  const getCityForLead = (lead: Lead) => {
    return extractCityFromLocation(
      lead.location, 
      lead.zipCode || 'N/A', 
      lead.address || '' // Pass address as string instead of showFullDetails boolean
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {leads.map(renderLeadCard)}
    </div>
  );
};

export default MarketplaceLeadsList;
