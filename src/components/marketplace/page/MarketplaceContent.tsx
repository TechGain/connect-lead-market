import React, { useState } from 'react';
import LeadFilters from '@/components/LeadFilters';
import MarketplaceViewSelector, { ViewMode } from '@/components/marketplace/MarketplaceViewSelector';
import MarketplaceStats from '@/components/marketplace/MarketplaceStats';
import MarketplaceLeadsList from '@/components/marketplace/MarketplaceLeadsList';
import { Lead } from '@/types/lead';
import { Button } from '@/components/ui/button';
import { RefreshCcw, Bug } from 'lucide-react';
import { format } from 'date-fns';
import { extractCityFromLocation } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
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
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const isMobile = useIsMobile();

  // Calculate lead statistics
  const totalLeads = filteredLeads.length;
  const availableLeads = filteredLeads.filter(lead => lead.status === 'new').length;
  const soldLeads = filteredLeads.filter(lead => lead.status === 'sold' || lead.status === 'pending').length;
  return <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Lead Marketplace</h1>
          <p className="text-gray-600">Browse available leads from verified sellers</p>
        </div>
        
        <div className="flex items-center gap-2">
          
          <Button variant="outline" size="sm" onClick={handleRefresh} className="flex items-center gap-2">
            <RefreshCcw size={16} />
            Refresh Data
          </Button>
        </div>
      </div>
      
      {/* Responsive Layout for Filters, Stats and View Controls */}
      <div className={`${isMobile ? 'flex flex-col space-y-4' : 'flex items-center'} mb-4`}>
        <div className={`${isMobile ? 'w-full' : 'w-[250px]'}`}>
          <LeadFilters onFilterChange={handleFilterChange} compact={true} />
        </div>
        
        <div className={`${isMobile ? 'w-full' : 'flex-1 mx-4'}`}>
          <MarketplaceStats totalLeads={totalLeads} availableLeads={availableLeads} soldLeads={soldLeads} compact={true} />
        </div>
        
        <div className={`${isMobile ? 'w-full flex justify-center' : ''}`}>
          <MarketplaceViewSelector viewMode={viewMode} onViewModeChange={onViewModeChange} compact={true} />
        </div>
      </div>
      
      {/* Debug Panel */}
      {showDebugPanel && <div className="mb-6 p-4 border rounded-md bg-slate-50 overflow-auto max-h-96">
          <h3 className="font-bold mb-2 flex items-center">
            <Bug size={16} className="mr-2" /> 
            Location Extraction Debug
            <Badge variant="outline" className="ml-2">First 10 leads</Badge>
          </h3>
          <div className="grid grid-cols-1 gap-3 text-sm font-mono mb-4">
            <div className="bg-white p-2 rounded border font-semibold">
              <div className="grid grid-cols-3 gap-1">
                <div>Location</div>
                <div>ZIP Code</div>
                <div>Extracted City</div>
              </div>
            </div>
            {filteredLeads.slice(0, 10).map((lead, i) => {
          const city = extractCityFromLocation(lead.location, lead.zipCode || 'N/A');
          return <div key={i} className="bg-white p-2 rounded border">
                  <div className="grid grid-cols-3 gap-1">
                    <div className="truncate" title={lead.location || 'N/A'}>
                      {lead.location || 'N/A'}
                    </div>
                    <div>{lead.zipCode || 'N/A'}</div>
                    <div className={`font-bold ${city === 'N/A' ? 'text-red-500' : 'text-green-600'}`}>
                      {city}
                    </div>
                  </div>
                </div>;
        })}
          </div>
          
          <div className="bg-slate-100 p-3 rounded border border-slate-200 text-xs mt-4">
            <h4 className="font-bold mb-1">City Extraction Information</h4>
            <p className="mb-1">
              The system uses multiple extraction methods in this priority order:
            </p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Direct ZIP code lookup (fastest and most reliable)</li>
              <li>City, State ZIP pattern extraction</li>
              <li>Street, City, State ZIP pattern extraction</li>
              <li>Pipe-separated address format extraction</li>
              <li>City, State pattern (no ZIP)</li>
              <li>Various other patterns for multi-part addresses</li>
            </ol>
            <p className="mt-2">
              If all methods fail, the system displays "N/A" instead of showing state/country names.
            </p>
          </div>
        </div>}
      
      <MarketplaceLeadsList leads={filteredLeads} isLoading={leadsLoading} onPurchase={handlePurchaseLead} onResetFilters={resetFilters} viewMode={viewMode} showFullDetails={false} />
    </>;
};
export default MarketplaceContent;