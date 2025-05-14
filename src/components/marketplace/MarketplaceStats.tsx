
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
      <div className="flex flex-col items-center p-4 bg-green-50/80 rounded-lg border border-green-100 shadow-sm">
        <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-2">
          <CircleCheck className="text-green-600 h-6 w-6" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">Available Leads</h3>
        <Badge variant="outline" className="mt-2 text-lg px-4 py-1 font-mono bg-white">{availableLeads}</Badge>
      </div>
      
      <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg border border-gray-100 shadow-sm">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-2">
          <CircleX className="text-gray-500 h-6 w-6" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">Sold Leads</h3>
        <Badge variant="outline" className="mt-2 text-lg px-4 py-1 font-mono bg-white">{soldLeads}</Badge>
      </div>
    </div>
  );
};

export default MarketplaceStats;
