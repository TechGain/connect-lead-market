
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CircleDot, CircleCheck, CircleX } from 'lucide-react';

interface MarketplaceStatsProps {
  totalLeads: number;
  availableLeads: number;
  soldLeads: number;
}

const MarketplaceStats: React.FC<MarketplaceStatsProps> = ({
  totalLeads,
  availableLeads,
  soldLeads
}) => {
  return (
    <div className="flex flex-wrap gap-3 mb-6 bg-muted/50 p-3 rounded-md">
      <div className="flex items-center mr-4">
        <CircleDot className="text-gray-600 mr-1 h-4 w-4" />
        <span className="text-sm font-medium mr-1">Total Leads:</span>
        <Badge variant="outline" className="font-mono">{totalLeads}</Badge>
      </div>
      
      <div className="flex items-center mr-4">
        <CircleCheck className="text-green-600 mr-1 h-4 w-4" />
        <span className="text-sm font-medium mr-1">Available:</span>
        <Badge variant="outline" className="bg-green-50 font-mono">{availableLeads}</Badge>
      </div>
      
      <div className="flex items-center">
        <CircleX className="text-gray-500 mr-1 h-4 w-4" />
        <span className="text-sm font-medium mr-1">Sold:</span>
        <Badge variant="outline" className="font-mono">{soldLeads}</Badge>
      </div>
    </div>
  );
};

export default MarketplaceStats;
