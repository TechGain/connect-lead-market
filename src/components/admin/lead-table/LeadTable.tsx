
import React from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Lead } from '@/types/lead';
import LeadTableRow from './LeadTableRow';

interface LeadTableProps {
  leads: Lead[];
  onDeleteClick: (lead: Lead) => void;
  onRefundClick: (lead: Lead) => void;
}

const LeadTable: React.FC<LeadTableProps> = ({ leads, onDeleteClick, onRefundClick }) => {
  if (!leads || leads.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No leads found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Confirmation</TableHead>
            <TableHead>Seller</TableHead>
            <TableHead>Buyer</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Purchased</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <LeadTableRow 
              key={lead.id}
              lead={lead} 
              onDeleteClick={onDeleteClick} 
              onRefundClick={onRefundClick} 
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default LeadTable;
