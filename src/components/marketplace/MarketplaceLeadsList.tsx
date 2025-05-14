
import React from 'react';
import { Lead } from '@/types/lead';
import LeadCard from '@/components/LeadCard';
import { Loader2 } from 'lucide-react';
import { ViewMode } from './MarketplaceViewSelector';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatLeadType } from '@/lib/utils';

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
  // Variables are kept for future use but not displayed
  const availableLeads = leads.filter(lead => lead.status === 'new').length;
  const soldLeads = leads.filter(lead => lead.status === 'sold' || lead.status === 'pending').length;
  
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
  console.log('Current view mode:', viewMode);

  // Render the leads according to the selected view mode
  const renderLeads = () => {
    switch (viewMode) {
      case 'largeCards':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leads.map(lead => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onPurchase={lead.status === 'new' ? onPurchase : undefined}
                showFullDetails={false}
              />
            ))}
          </div>
        );
        
      case 'smallCards':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {leads.map(lead => (
              <Card key={lead.id} className="h-full flex flex-col hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{formatLeadType(lead.type)}</h3>
                    <Badge variant={lead.status === 'new' ? 'default' : 'secondary'}>
                      {lead.status === 'new' ? 'Available' : 'Sold'}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500 mb-2">
                    <span>{lead.zipCode || 'Unknown ZIP'}</span>
                  </div>
                  <div className="mt-auto pt-2 flex justify-between items-center">
                    <div>
                      <span className="text-sm font-bold">{formatCurrency(lead.price)}</span>
                    </div>
                    {lead.status === 'new' && onPurchase && (
                      <button 
                        onClick={() => onPurchase(lead)} 
                        className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded hover:bg-primary/90"
                      >
                        Buy
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );
        
      case 'list':
        return (
          <div className="space-y-2">
            {leads.map(lead => (
              <div 
                key={lead.id} 
                className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <div className="mr-4">
                    <Badge variant={lead.status === 'new' ? 'default' : 'secondary'} className="mr-2">
                      {lead.status === 'new' ? 'Available' : 'Sold'}
                    </Badge>
                    <span className="font-medium">{formatLeadType(lead.type)}</span>
                  </div>
                  <span className="text-gray-500 text-sm mr-4">{lead.zipCode || 'Unknown ZIP'}</span>
                  <div className="hidden md:block">
                    <span className="text-gray-500 text-sm">Rating: {lead.qualityRating || 0}/5</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="font-bold">{formatCurrency(lead.price)}</span>
                  {lead.status === 'new' && onPurchase && (
                    <button 
                      onClick={() => onPurchase(lead)} 
                      className="bg-primary text-primary-foreground px-3 py-1 rounded text-sm hover:bg-primary/90"
                    >
                      Buy Lead
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        );
        
      case 'compact':
        return (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-2 text-left">Type</th>
                  <th className="p-2 text-left">Location</th>
                  <th className="p-2 text-left">Rating</th>
                  <th className="p-2 text-right">Price</th>
                  <th className="p-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {leads.map(lead => (
                  <tr key={lead.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      <div className="flex items-center">
                        <Badge variant={lead.status === 'new' ? 'default' : 'secondary'} className="mr-2">
                          {lead.status === 'new' ? 'Available' : 'Sold'}
                        </Badge>
                        <span>{formatLeadType(lead.type)}</span>
                      </div>
                    </td>
                    <td className="p-2">{lead.zipCode || 'Unknown ZIP'}</td>
                    <td className="p-2">{lead.qualityRating || 0}/5</td>
                    <td className="p-2 text-right font-bold">{formatCurrency(lead.price)}</td>
                    <td className="p-2 text-center">
                      {lead.status === 'new' && onPurchase && (
                        <button 
                          onClick={() => onPurchase(lead)} 
                          className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs hover:bg-primary/90"
                        >
                          Buy
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leads.map(lead => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onPurchase={lead.status === 'new' ? onPurchase : undefined}
                showFullDetails={false}
              />
            ))}
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {renderLeads()}
    </div>
  );
};

export default MarketplaceLeadsList;
