
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
      <div className="flex items-center p-4 bg-green-50/80 rounded-lg border border-green-100 shadow-sm w-full">
        <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mr-4">
          <CircleCheck className="text-green-600 h-6 w-6" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900">Available Leads</h3>
          <Badge variant="outline" className="text-lg px-4 py-0.5 font-mono bg-white">{availableLeads}</Badge>
        </div>
      </div>
      
      {isAdmin && (
        <div className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-100 shadow-sm w-full">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mr-4">
            <CircleX className="text-gray-500 h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Sold Leads</h3>
            <Badge variant="outline" className="text-lg px-4 py-0.5 font-mono bg-white">{soldLeads}</Badge>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketplaceStats;
