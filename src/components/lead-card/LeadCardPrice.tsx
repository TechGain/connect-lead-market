
import React from 'react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { Lead } from '@/types/lead';

interface LeadCardPriceProps {
  lead: Lead;
  displayPrice: number;
  onPurchase?: (lead: Lead) => void;
  isOwner: boolean;
  isPurchased: boolean;
}

const LeadCardPrice: React.FC<LeadCardPriceProps> = ({
  lead,
  displayPrice,
  onPurchase,
  isOwner,
  isPurchased
}) => {
  return (
    <div className="flex items-center">
      <div className="mr-4">
        <span className="font-bold text-lg">{formatCurrency(displayPrice)}</span>
      </div>
      
      {/* Only show the Buy Lead button for new leads */}
      {lead.status === 'new' && onPurchase && !isOwner && !isPurchased && (
        <Button 
          size="sm" 
          onClick={() => onPurchase(lead)}
        >
          Buy Lead
        </Button>
      )}
    </div>
  );
};

export default LeadCardPrice;
