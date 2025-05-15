
import React from 'react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { Lead } from '@/types/lead';

interface LeadCardFooterProps {
  lead: Lead;
  onPurchase?: (lead: Lead) => void;
  isOwner: boolean;
}

const LeadCardFooter: React.FC<LeadCardFooterProps> = ({ 
  lead, 
  onPurchase,
  isOwner
}) => {
  return (
    <div className="pt-2 border-t flex justify-between items-center">
      <div></div>
      
      <div className="flex items-center">
        <div className="mr-4">
          <span className="font-bold text-lg">{formatCurrency(lead.price)}</span>
        </div>
        
        {/* Only show the Buy Lead button for new leads */}
        {lead.status === 'new' && onPurchase && !isOwner && (
          <Button 
            size="sm" 
            onClick={() => onPurchase(lead)}
          >
            Buy Lead
          </Button>
        )}
      </div>
    </div>
  );
};

export default LeadCardFooter;
