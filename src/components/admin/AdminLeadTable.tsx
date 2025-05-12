
import React from 'react';
import { Lead } from '@/types/lead';
import LeadCard from '@/components/LeadCard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/format-helpers';

interface AdminLeadTableProps {
  leads: Lead[];
}

const AdminLeadTable: React.FC<AdminLeadTableProps> = ({ leads }) => {
  if (!leads || leads.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No leads found.</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge className="bg-green-500 hover:bg-green-600">New</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>;
      case 'sold':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Sold</Badge>;
      case 'erased':
        return <Badge variant="destructive">Erased</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Seller</TableHead>
            <TableHead>Buyer</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Purchased</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id}>
              <TableCell>{lead.type}</TableCell>
              <TableCell>{lead.location}</TableCell>
              <TableCell>${formatCurrency(lead.price)}</TableCell>
              <TableCell>{getStatusBadge(lead.status)}</TableCell>
              <TableCell>{lead.sellerName || lead.sellerId}</TableCell>
              <TableCell>{lead.buyerName || lead.buyerId || '-'}</TableCell>
              <TableCell>{new Date(lead.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>
                {lead.purchasedAt 
                  ? new Date(lead.purchasedAt).toLocaleDateString() 
                  : '-'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AdminLeadTable;
