
import React from 'react';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { Lead } from '@/types/lead';

interface LeadCardActionsProps {
  lead: Lead;
  isOwner: boolean;
  onEdit?: (lead: Lead) => void;
  onDelete?: (lead: Lead) => void;
  onRate?: (lead: Lead) => void;
  isPurchased?: boolean;
}

const LeadCardActions: React.FC<LeadCardActionsProps> = ({
  lead,
  isOwner,
  onEdit,
  onDelete,
  onRate,
  isPurchased = false
}) => {
  return (
    <div className="flex items-center gap-2">
      {isPurchased && onRate && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onRate(lead)}
        >
          Rate This Lead
        </Button>
      )}
      
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
    </div>
  );
};

export default LeadCardActions;
