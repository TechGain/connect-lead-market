
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CircleCheck, CircleX } from 'lucide-react';
import { useUserRole } from '@/hooks/use-user-role';
import { useIsMobile } from '@/hooks/use-mobile';

interface MarketplaceStatsProps {
  totalLeads: number;
  availableLeads: number;
  soldLeads: number;
  compact?: boolean;
}

const MarketplaceStats: React.FC<MarketplaceStatsProps> = ({
  availableLeads,
  soldLeads,
  compact = false
}) => {
  const { role } = useUserRole();
  const isAdmin = role === 'admin';
  const isMobile = useIsMobile();
  
  if (compact) {
    return (
      <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'items-center'} w-full justify-start ${isMobile ? '' : 'gap-4'}`}>
        <div className="flex items-center bg-green-50 rounded-md px-3.5 py-1.5 border border-green-100">
          <CircleCheck className="text-green-600 h-4 w-4 mr-2" />
          <span className="text-sm font-medium">Available: </span>
          <Badge variant="outline" className="ml-1.5 font-mono bg-white text-xs">{availableLeads}</Badge>
        </div>
        
        {isAdmin && (
          <div className="flex items-center bg-gray-50 rounded-md px-3.5 py-1.5 border border-gray-100">
            <CircleX className="text-gray-500 h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Sold: </span>
            <Badge variant="outline" className="ml-1.5 font-mono bg-white text-xs">{soldLeads}</Badge>
          </div>
        )}
      </div>
    );
  }
  
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
