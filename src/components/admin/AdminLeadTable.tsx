
import React, { useState } from 'react';
import { Lead } from '@/types/lead';
import { useAdminLeadDelete } from '@/hooks/use-admin-lead-delete';
import { useAdminLeadRefund } from '@/hooks/use-admin-lead-refund';
import LeadTable from './lead-table/LeadTable';
import DeleteLeadDialog from './lead-table/DeleteLeadDialog';
import RefundLeadDialog from './lead-table/RefundLeadDialog';
import LeadDetailModal from './lead-table/LeadDetailModal';

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
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const { deleteLead, isDeleting } = useAdminLeadDelete();
  const { refundLead, isRefunding } = useAdminLeadRefund();

  const handleDeleteClick = (lead: Lead) => {
    setSelectedLead(lead);
    setIsDeleteDialogOpen(true);
  };

  const handleRefundClick = (lead: Lead) => {
    setSelectedLead(lead);
    setIsRefundDialogOpen(true);
  };

  const handleRowClick = (lead: Lead) => {
    setSelectedLead(lead);
    setIsDetailModalOpen(true);
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

  return (
    <>
      <LeadTable 
        leads={leads} 
        onDeleteClick={handleDeleteClick} 
        onRefundClick={handleRefundClick}
        onRowClick={handleRowClick}
      />

      <DeleteLeadDialog 
        isOpen={isDeleteDialogOpen} 
        onClose={() => setIsDeleteDialogOpen(false)} 
        onConfirm={confirmDeleteLead} 
        isDeleting={isDeleting} 
      />

      <RefundLeadDialog 
        isOpen={isRefundDialogOpen} 
        onClose={() => setIsRefundDialogOpen(false)} 
        onConfirm={confirmRefundLead} 
        isRefunding={isRefunding} 
      />

      <LeadDetailModal
        lead={selectedLead}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      />
    </>
  );
};

export default AdminLeadTable;
