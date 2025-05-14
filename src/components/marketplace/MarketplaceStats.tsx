
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CircleCheck, CircleX } from 'lucide-react';

interface MarketplaceStatsProps {
  totalLeads: number;
  availableLeads: number;
  soldLeads: number;
}

const MarketplaceStats: React.FC<MarketplaceStatsProps> = ({
  availableLeads,
  soldLeads
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div className="flex items-center p-3 bg-green-50/80 rounded-lg border border-green-100 shadow-sm">
        <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full mr-3">
          <CircleCheck className="text-green-600 h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-medium text-gray-900">Available Leads</h3>
          <Badge variant="outline" className="text-base px-3 py-0.5 font-mono bg-white">{availableLeads}</Badge>
        </div>
      </div>
      
      <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100 shadow-sm">
        <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full mr-3">
          <CircleX className="text-gray-500 h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-medium text-gray-900">Sold Leads</h3>
          <Badge variant="outline" className="text-base px-3 py-0.5 font-mono bg-white">{soldLeads}</Badge>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceStats;
