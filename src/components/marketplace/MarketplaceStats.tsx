
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CircleCheck, CircleX } from 'lucide-react';
import { useUserRole } from '@/hooks/use-user-role';

interface MarketplaceStatsProps {
  totalLeads: number;
  availableLeads: number;
  soldLeads: number;
}

const MarketplaceStats: React.FC<MarketplaceStatsProps> = ({
  availableLeads,
  soldLeads
}) => {
  const { role } = useUserRole();
  const isAdmin = role === 'admin';
  
  return (
    <div className="flex flex-row gap-3 mt-4">
      <div className="flex items-center p-2 bg-green-50/80 rounded-lg border border-green-100 shadow-sm">
        <div className="flex items-center justify-center w-7 h-7 bg-green-100 rounded-full mr-2">
          <CircleCheck className="text-green-600 h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-900">Available</h3>
          <Badge variant="outline" className="text-sm px-2 py-0 font-mono bg-white">{availableLeads}</Badge>
        </div>
      </div>
      
      {isAdmin && (
        <div className="flex items-center p-2 bg-gray-50 rounded-lg border border-gray-100 shadow-sm">
          <div className="flex items-center justify-center w-7 h-7 bg-gray-100 rounded-full mr-2">
            <CircleX className="text-gray-500 h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900">Sold</h3>
            <Badge variant="outline" className="text-sm px-2 py-0 font-mono bg-white">{soldLeads}</Badge>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketplaceStats;
