
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
  showButton?: boolean;
  showPrice?: boolean;
}

const LeadCardPrice: React.FC<LeadCardPriceProps> = ({
  lead,
  displayPrice,
  onPurchase,
  isOwner,
  isPurchased,
  showButton = true,
  showPrice = true
}) => {
  return (
    <>
      {/* Price display */}
      {showPrice && (
        <span className="font-bold text-lg">{formatCurrency(displayPrice)}</span>
      )}
      
      {/* Buy Lead button */}
      {lead.status === 'new' && onPurchase && !isOwner && !isPurchased && showButton && (
        <Button 
          size="sm" 
          onClick={() => onPurchase(lead)}
          className="font-medium"
        >
          Buy Lead
        </Button>
      )}
      
      {/* Status indicator (shown when lead is purchased or owned) */}
      {showPrice && (isPurchased || isOwner) && lead.status !== 'new' && (
        <span className="text-xs text-gray-500 ml-2">
          {lead.status === 'sold' ? 'Sold' : 'Pending'}
        </span>
      )}
    </>
  );
};

export default LeadCardPrice;
