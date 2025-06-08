
import React from 'react';
import { MapPin } from 'lucide-react';
import { Lead } from '@/types/lead';
import { formatLeadType, extractCityFromLocation } from '@/lib/utils';
import LeadCardStatus from './LeadCardStatus';
import LeadCardActions from './LeadCardActions';

interface LeadCardHeaderProps {
  lead: Lead;
  showFullDetails: boolean;
  isOwner: boolean;
  onEdit?: (lead: Lead) => void;
  onDelete?: (lead: Lead) => void;
  onRate?: (lead: Lead) => void;
  isPurchased?: boolean;
}

const LeadCardHeader: React.FC<LeadCardHeaderProps> = ({ 
  lead, 
  showFullDetails, 
  isOwner,
  onEdit,
  onDelete,
  onRate,
  isPurchased = false
}) => {
  // Get city using our enhanced extraction function with full address
  const cityDisplay = showFullDetails 
    ? lead.location 
    : extractCityFromLocation(lead.location, lead.zipCode || 'N/A', lead.address);
  
  return (
    <div className="flex justify-between items-start">
      <div>
        <h3 className="font-medium text-lg">{formatLeadType(lead.type)}</h3>
        <div className="flex items-center text-gray-500 mt-1">
          <MapPin className="h-4 w-4 mr-1" />
          <span>{cityDisplay}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <LeadCardActions 
          lead={lead}
          isOwner={isOwner}
          onEdit={onEdit}
          onDelete={onDelete}
          onRate={onRate}
          isPurchased={isPurchased}
        />
        <LeadCardStatus status={lead.status} />
      </div>
    </div>
  );
};

export default LeadCardHeader;
