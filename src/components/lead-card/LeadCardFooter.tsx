
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
    <div className="pt-2 border-t flex justify-between items-center w-full">
      {/* Price now appears on the left side */}
      <div className="font-bold text-lg">
        <LeadCardPrice 
          lead={lead}
          displayPrice={displayPrice}
          onPurchase={onPurchase}
          isOwner={isOwner}
          isPurchased={isPurchased}
          showButton={false}
        />
      </div>
      
      <div className="flex items-center gap-2">
        {/* Actions in the middle (if applicable) */}
        {isOwner || isPurchased ? (
          <LeadCardActions
            lead={lead}
            isOwner={isOwner}
            isPurchased={isPurchased}
            onRate={onRate}
          />
        ) : null}
        
        {/* Buy Lead button remains on the right */}
        {lead.status === 'new' && onPurchase && !isOwner && !isPurchased && (
          <LeadCardPrice 
            lead={lead}
            displayPrice={displayPrice}
            onPurchase={onPurchase}
            isOwner={isOwner}
            isPurchased={isPurchased}
            showButton={true}
            showPrice={false}
          />
        )}
      </div>
    </div>
  );
};

export default LeadCardFooter;
