
import React, { useState } from 'react';
import { Lead } from '@/types/lead';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { formatCurrency } from '@/utils/format-helpers';
import { Trash2, RefreshCcw } from 'lucide-react';
import { useAdminLeadDelete } from '@/hooks/use-admin-lead-delete';
import { useAdminLeadRefund } from '@/hooks/use-admin-lead-refund';

interface AdminLeadTableProps {
  leads: Lead[];
  onLeadDeleted?: () => void;
  onLeadRefunded?: () => void;
}

const AdminLeadTable: React.FC<AdminLeadTableProps> = ({ 
  leads, 
  onLeadDeleted,
  onLeadRefunded 
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const { deleteLead, isDeleting } = useAdminLeadDelete();
  const { refundLead, isRefunding } = useAdminLeadRefund();

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
      case 'refunded':
        return <Badge variant="outline" className="border-orange-500 text-orange-600">Refunded</Badge>;
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

  const handleRefundClick = (lead: Lead) => {
    setSelectedLead(lead);
    setIsRefundDialogOpen(true);
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

  const confirmRefundLead = async () => {
    if (selectedLead) {
      const success = await refundLead(selectedLead.id);
      if (success && onLeadRefunded) {
        onLeadRefunded();
      }
      setIsRefundDialogOpen(false);
    }
  };

  // Check if lead can be refunded (only sold leads can be refunded)
  const canBeRefunded = (lead: Lead) => {
    return lead.status === 'sold';
  };

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
                      : lead.status === 'refunded'
                        ? 'bg-orange-50'
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
                <TableCell className="space-x-1">
                  {canBeRefunded(lead) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRefundClick(lead)}
                      className="h-8 w-8 text-orange-500 hover:text-orange-700 hover:bg-orange-50"
                      title="Mark as Refunded"
                    >
                      <RefreshCcw className="h-4 w-4" />
                    </Button>
                  )}
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

      {/* Delete Dialog */}
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

      {/* Refund Dialog */}
      <Dialog open={isRefundDialogOpen} onOpenChange={setIsRefundDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refund Lead</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark this lead as refunded? This indicates that the buyer has been refunded for their purchase.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRefundDialogOpen(false)}>Cancel</Button>
            <Button variant="default" onClick={confirmRefundLead} disabled={isRefunding} className="bg-orange-500 hover:bg-orange-600">
              {isRefunding ? 'Processing...' : 'Mark as Refunded'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminLeadTable;
