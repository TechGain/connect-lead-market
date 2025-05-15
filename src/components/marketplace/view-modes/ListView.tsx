
import React from 'react';
import { Lead } from '@/types/lead';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatLeadType, applyBuyerPriceMarkup } from '@/lib/utils';

interface ListViewProps {
  leads: Lead[];
  onPurchase: (lead: Lead) => void;
}

const ListView: React.FC<ListViewProps> = ({ leads, onPurchase }) => {
  return (
    <div className="space-y-2">
      {leads.map(lead => (
        <div 
          key={lead.id} 
          className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center">
            <div className="mr-4">
              <Badge variant={lead.status === 'new' ? 'default' : 'secondary'} className="mr-2">
                {lead.status === 'new' ? 'Available' : 'Sold'}
              </Badge>
              <span className="font-medium">{formatLeadType(lead.type)}</span>
            </div>
            <span className="text-gray-500 text-sm mr-4">{lead.zipCode || 'Unknown ZIP'}</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="font-bold">{formatCurrency(applyBuyerPriceMarkup(lead.price))}</span>
            {lead.status === 'new' && onPurchase && (
              <button 
                onClick={() => onPurchase(lead)} 
                className="bg-primary text-primary-foreground px-3 py-1 rounded text-sm hover:bg-primary/90"
              >
                Buy Lead
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ListView;
