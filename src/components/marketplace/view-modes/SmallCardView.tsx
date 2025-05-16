
import React from 'react';
import { Lead } from '@/types/lead';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatLeadType, applyBuyerPriceMarkup } from '@/lib/utils';

interface SmallCardViewProps {
  leads: Lead[];
  onPurchase: (lead: Lead) => void;
}

const SmallCardView: React.FC<SmallCardViewProps> = ({ leads, onPurchase }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {leads.map(lead => (
        <Card key={lead.id} className="h-full flex flex-col hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex flex-col h-full">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium">{formatLeadType(lead.type)}</h3>
              <Badge variant={lead.status === 'new' ? 'default' : 'secondary'}>
                {lead.status === 'new' ? 'Available' : 'Sold'}
              </Badge>
            </div>
            <div className="text-sm text-gray-500 mb-2">
              <span>{lead.zipCode || 'Unknown ZIP'}</span>
            </div>
            <div className="mt-auto pt-2 flex justify-between items-center">
              <div>
                {/* Left side empty for consistency with larger cards */}
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm font-bold">{formatCurrency(applyBuyerPriceMarkup(lead.price))}</span>
                {lead.status === 'new' && onPurchase && (
                  <button 
                    onClick={() => onPurchase(lead)} 
                    className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded hover:bg-primary/90"
                  >
                    Buy
                  </button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SmallCardView;
