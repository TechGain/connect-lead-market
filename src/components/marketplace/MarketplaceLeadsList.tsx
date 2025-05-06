
import React from 'react';
import { Lead } from '@/types/lead';
import LeadCard from '@/components/LeadCard';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface MarketplaceLeadsListProps {
  leads: Lead[];
  isLoading: boolean;
  onPurchase: (lead: Lead) => void;
  onResetFilters: () => void;
  leadCounts?: {
    available: number;
    sold: number;
    pending: number;
    total: number;
  };
}

const MarketplaceLeadsList: React.FC<MarketplaceLeadsListProps> = ({
  leads,
  isLoading,
  onPurchase,
  onResetFilters,
  leadCounts
}) => {
  // Use provided leadCounts or calculate them here as fallback
  const availableLeads = leadCounts?.available || leads.filter(lead => lead.status === 'new').length;
  const soldLeads = leadCounts?.sold || leads.filter(lead => lead.status === 'sold').length;
  const pendingLeads = leadCounts?.pending || leads.filter(lead => lead.status === 'pending').length;
  const soldAndPendingLeads = soldLeads + pendingLeads;
  
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

  // Debug what leads we're displaying
  console.log('MarketplaceLeadsList: Displaying leads:', leads.length);
  console.log('Lead statuses being displayed:', leads.map(l => l.status).join(', '));
  
  // Additional debug information about leadCounts
  console.log('Lead counts from props:', leadCounts);
  console.log('Calculated counts in component:', {
    available: availableLeads,
    sold: soldLeads,
    pending: pendingLeads
  });

  return (
    <div className="space-y-6">
      {/* Display count info */}
      <div className="flex flex-col gap-2">
        <Alert variant="default" className="bg-blue-50 border border-blue-100">
          <AlertDescription className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-blue-500" />
            <span>
              Showing {leads.length} leads ({availableLeads} available, {soldAndPendingLeads} sold/pending)
              {soldAndPendingLeads > 0 && " - Sold leads appear with a gray background"}
            </span>
          </AlertDescription>
        </Alert>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {leads.map(lead => (
          <LeadCard
            key={lead.id}
            lead={lead}
            onPurchase={lead.status === 'new' ? onPurchase : undefined}
            showFullDetails={false} // Never show full details in marketplace
          />
        ))}
      </div>
    </div>
  );
};

export default MarketplaceLeadsList;
