
import React from 'react';
import { Lead } from '@/types/lead';
import { applyBuyerPriceMarkup } from '@/lib/utils';
import LeadCardPrice from './LeadCardPrice';

interface LeadCardFooterProps {
  lead: Lead;
  onPurchase?: (lead: Lead) => void;
  isOwner: boolean;
  isPurchased?: boolean;
}

const LeadCardFooter: React.FC<LeadCardFooterProps> = ({ 
  lead, 
  onPurchase,
  isOwner,
  isPurchased = false
}) => {
  // Use original price for owners (sellers), apply markup for buyers
  const displayPrice = isOwner ? lead.price : applyBuyerPriceMarkup(lead.price);

  return (
    <div className="pt-2 border-t flex justify-between items-center">
      <div>
        {/* This space is now handled in LeadCardActions component */}
      </div>
      
      <LeadCardPrice 
        lead={lead}
        displayPrice={displayPrice}
        onPurchase={onPurchase}
        isOwner={isOwner}
        isPurchased={isPurchased}
      />
    </div>
  );
};

export default LeadCardFooter;
