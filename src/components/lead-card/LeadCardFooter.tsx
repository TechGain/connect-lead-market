
import React from 'react';
import { Button } from '@/components/ui/button';
import { formatCurrency, applyBuyerPriceMarkup } from '@/lib/utils';
import { Lead } from '@/types/lead';

interface LeadCardFooterProps {
  lead: Lead;
  onPurchase?: (lead: Lead) => void;
  isOwner: boolean;
  onRate?: (lead: Lead) => void;
  isPurchased?: boolean;
}

const LeadCardFooter: React.FC<LeadCardFooterProps> = ({ 
  lead, 
  onPurchase,
  isOwner,
  onRate,
  isPurchased = false
}) => {
  // Use original price for owners (sellers), apply markup for buyers
  const displayPrice = isOwner ? lead.price : applyBuyerPriceMarkup(lead.price);

  return (
    <div className="pt-2 border-t flex justify-between items-center">
      <div>
        {isPurchased && onRate && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRate(lead)}
          >
            Rate This Lead
          </Button>
        )}
      </div>
      
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
    </div>
  );
};

export default LeadCardFooter;
