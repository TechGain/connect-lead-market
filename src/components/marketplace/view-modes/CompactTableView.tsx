
import React from 'react';
import { Lead } from '@/types/lead';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatLeadType, applyBuyerPriceMarkup, extractCityFromLocation } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface CompactTableViewProps {
  leads: Lead[];
  onPurchase: (lead: Lead) => void;
}

const CompactTableView: React.FC<CompactTableViewProps> = ({ leads, onPurchase }) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Location</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-center">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map(lead => (
            <TableRow key={lead.id}>
              <TableCell>
                <div className="flex items-center">
                  <Badge variant={lead.status === 'new' ? 'default' : 'secondary'} className="mr-2">
                    {lead.status === 'new' ? 'Available' : 'Sold'}
                  </Badge>
                  <span>{formatLeadType(lead.type)}</span>
                </div>
              </TableCell>
              <TableCell>{extractCityFromLocation(lead.location, lead.zipCode || 'Unknown location')}</TableCell>
              <TableCell className="text-right font-bold">{formatCurrency(applyBuyerPriceMarkup(lead.price))}</TableCell>
              <TableCell className="text-center">
                {lead.status === 'new' && onPurchase && (
                  <button 
                    onClick={() => onPurchase(lead)} 
                    className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs hover:bg-primary/90"
                  >
                    Buy
                  </button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CompactTableView;
