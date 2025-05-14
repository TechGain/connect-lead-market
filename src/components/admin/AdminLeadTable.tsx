
import React, { useState } from 'react';
import { Lead } from '@/types/lead';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { formatCurrency } from '@/utils/format-helpers';
import { Trash2 } from 'lucide-react';
import { useAdminLeadDelete } from '@/hooks/use-admin-lead-delete';

interface AdminLeadTableProps {
  leads: Lead[];
  onLeadDeleted?: () => void;
}

const AdminLeadTable: React.FC<AdminLeadTableProps> = ({ leads, onLeadDeleted }) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const { deleteLead, isDeleting } = useAdminLeadDelete();

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

  const handleDeleteClick = (lead: Lead) => {
    setSelectedLead(lead);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteLead = async () => {
    if (selectedLead) {
      const success = await deleteLead(selectedLead.id);
      if (success && onLeadDeleted) {
        onLeadDeleted();
      }
      setIsDeleteDialogOpen(false);
    }
  };

  // Debug leads data
  console.log("Rendering leads in AdminLeadTable:", 
    leads.map(lead => ({ id: lead.id, status: lead.status, type: lead.type }))
  );

  return (
    <>
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
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => (
              <TableRow 
                key={lead.id} 
                className={
                  lead.status === 'erased' 
                    ? 'opacity-70 bg-red-50' 
                    : lead.status === 'sold'
                      ? 'bg-blue-50'
                      : ''
                }
              >
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
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteClick(lead)}
                    disabled={lead.status === 'erased'}
                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                    title="Delete Lead"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Lead</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this lead? This action will mark the lead as erased and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDeleteLead} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete Lead'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminLeadTable;
