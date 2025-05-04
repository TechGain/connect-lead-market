
import React from 'react';
import { Lead } from '@/types/lead';
import LeadCard from '@/components/LeadCard';
import { Loader2 } from 'lucide-react';

interface MarketplaceLeadsListProps {
  leads: Lead[];
  isLoading: boolean;
  onPurchase: (lead: Lead) => void;
  onResetFilters: () => void;
}

const MarketplaceLeadsList: React.FC<MarketplaceLeadsListProps> = ({
  leads,
  isLoading,
  onPurchase,
  onResetFilters
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <p>Loading leads...</p>
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="col-span-3 py-12 text-center">
        <h3 className="text-xl font-semibold mb-2">No leads match your filters</h3>
        <p className="text-gray-600 mb-4">Try adjusting your search criteria</p>
        <button 
          onClick={onResetFilters}
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
        >
          Reset Filters
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {leads.map(lead => (
        <LeadCard
          key={lead.id}
          lead={lead}
          onPurchase={onPurchase}
          showFullDetails={false} // Never show full details in marketplace
        />
      ))}
    </div>
  );
};

export default MarketplaceLeadsList;

