
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Lead } from '@/types/lead';
import { Button } from '@/components/ui/button';
import { Trash2, RefreshCcw, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/utils/format-helpers';
import LeadStatusBadge from './LeadStatusBadge';
import ConfirmationStatusBadge from './ConfirmationStatusBadge';

interface LeadTableRowProps {
  lead: Lead;
  onDeleteClick: (lead: Lead) => void;
  onRefundClick: (lead: Lead) => void;
  onMarkPaidClick: (lead: Lead) => void;
  onRowClick: (lead: Lead) => void;
}

const LeadTableRow: React.FC<LeadTableRowProps> = ({ 
  lead, 
  onDeleteClick, 
  onRefundClick,
  onMarkPaidClick,
  onRowClick 
}) => {
  // Check if lead can be refunded (only sold leads can be refunded)
  const canBeRefunded = (lead: Lead) => {
    return lead.status === 'sold';
  };

  // Check if lead can be marked as paid (only sold leads can be marked as paid)
  const canBeMarkedAsPaid = (lead: Lead) => {
    return lead.status === 'sold';
  };

  const handleRowClick = () => {
    onRowClick(lead);
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation(); // Prevent row click when clicking action buttons
    action();
  };

  return (
    <TableRow 
      key={lead.id} 
      className={`cursor-pointer hover:bg-gray-100 transition-colors ${
        lead.status === 'erased' 
          ? 'opacity-70 bg-red-50' 
          : lead.status === 'sold'
            ? 'bg-blue-50'
            : lead.status === 'paid'
              ? 'bg-green-50'
              : lead.status === 'refunded'
                ? 'bg-orange-50'
                : ''
      }`}
      onClick={handleRowClick}
    >
      <TableCell>{lead.type}</TableCell>
      <TableCell>{lead.location}</TableCell>
      <TableCell>${formatCurrency(lead.price)}</TableCell>
      <TableCell><LeadStatusBadge status={lead.status} /></TableCell>
      <TableCell>
        <ConfirmationStatusBadge lead={lead} />
      </TableCell>
      <TableCell>{lead.sellerName || lead.sellerId}</TableCell>
      <TableCell>{lead.buyerName || lead.buyerId || '-'}</TableCell>
      <TableCell>{new Date(lead.createdAt).toLocaleDateString()}</TableCell>
      <TableCell>
        {lead.purchasedAt 
          ? new Date(lead.purchasedAt).toLocaleDateString() 
          : '-'}
      </TableCell>
      <TableCell className="space-x-1">
        {canBeMarkedAsPaid(lead) && (
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => handleActionClick(e, () => onMarkPaidClick(lead))}
            className="h-8 w-8 text-green-500 hover:text-green-700 hover:bg-green-50"
            title="Mark as Paid"
          >
            <DollarSign className="h-4 w-4" />
          </Button>
        )}
        {canBeRefunded(lead) && (
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => handleActionClick(e, () => onRefundClick(lead))}
            className="h-8 w-8 text-orange-500 hover:text-orange-700 hover:bg-orange-50"
            title="Mark as Refunded"
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => handleActionClick(e, () => onDeleteClick(lead))}
          disabled={lead.status === 'erased'}
          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
          title="Delete Lead"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default LeadTableRow;
