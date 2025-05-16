
import React from 'react';
import { Lead } from '@/types/lead';
import { applyBuyerPriceMarkup } from '@/lib/utils';
import LeadCardPrice from './LeadCardPrice';
import LeadCardActions from './LeadCardActions';

interface LeadCardFooterProps {
  lead: Lead;
  onPurchase?: (lead: Lead) => void;
  isOwner: boolean;
  isPurchased?: boolean;
  onRate?: (lead: Lead) => void;
}

const LeadCardFooter: React.FC<LeadCardFooterProps> = ({ 
  lead, 
  onPurchase,
  isOwner,
  isPurchased = false,
  onRate
}) => {
  // Use original price for owners (sellers), apply markup for buyers
  const displayPrice = isOwner ? lead.price : applyBuyerPriceMarkup(lead.price);

  return (
    <div className="pt-2 border-t flex justify-between items-center">
      <div>
        {/* Place for any left-aligned actions */}
        {isOwner || isPurchased ? (
          <LeadCardActions
            lead={lead}
            isOwner={isOwner}
            isPurchased={isPurchased}
            onRate={onRate}
          />
        ) : null}
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
