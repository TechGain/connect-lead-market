
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
    <div className="flex items-center gap-3">
      <div>
        <span className="font-bold text-lg text-primary">{formatCurrency(displayPrice)}</span>
      </div>
      
      {/* Only show the Buy Lead button for new leads */}
      {lead.status === 'new' && onPurchase && !isOwner && !isPurchased && (
        <Button 
          size="sm" 
          onClick={() => onPurchase(lead)}
          className="font-medium"
        >
          Buy Lead
        </Button>
      )}
      
      {/* When lead is purchased or owned, we just show the price */}
      {(isPurchased || isOwner) && lead.status !== 'new' && (
        <span className="text-xs text-gray-500">
          {lead.status === 'sold' ? 'Sold' : 'Pending'}
        </span>
      )}
    </div>
  );
};

export default LeadCardPrice;
