
import React from 'react';
import { MapPin, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatLeadType } from '@/lib/utils';
import { Lead } from '@/types/lead';

interface LeadCardHeaderProps {
  lead: Lead;
  showFullDetails: boolean;
  isOwner: boolean;
  onEdit?: (lead: Lead) => void;
  onDelete?: (lead: Lead) => void;
}

const LeadCardHeader: React.FC<LeadCardHeaderProps> = ({ 
  lead, 
  showFullDetails, 
  isOwner,
  onEdit,
  onDelete
}) => {
  // Check if lead is sold
  const isSold = lead.status === 'sold' || lead.status === 'pending';
  
  return (
    <div className="flex justify-between items-start">
      <div>
        <h3 className="font-medium text-lg">{formatLeadType(lead.type)}</h3>
        {showFullDetails ? (
          <div className="flex items-center text-gray-500 mt-1">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{lead.location}</span>
          </div>
        ) : (
          <div className="flex items-center text-gray-500 mt-1">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{lead.zipCode || 'Unknown ZIP'}</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        {isOwner && (
          <>
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                className="p-1 h-auto"
                onClick={() => onEdit(lead)}
                title="Edit Lead"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="p-1 h-auto text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={() => onDelete(lead)}
                title="Delete Lead"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </>
        )}
        <Badge variant={isSold ? 'secondary' : 'default'}>
          {isSold ? 'Sold' : 'Available'}
        </Badge>
      </div>
    </div>
  );
};

export default LeadCardHeader;
