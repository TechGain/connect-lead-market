
import React, { useState } from 'react';
import { Lead } from '@/types/lead';
import { useAdminLeadDelete } from '@/hooks/use-admin-lead-delete';
import { useAdminLeadRefund } from '@/hooks/use-admin-lead-refund';
import { useAdminLeadMarkPaid } from '@/hooks/use-admin-lead-mark-paid';
import LeadTable from './lead-table/LeadTable';
import DeleteLeadDialog from './lead-table/DeleteLeadDialog';
import RefundLeadDialog from './lead-table/RefundLeadDialog';
import MarkPaidDialog from './lead-table/MarkPaidDialog';
import LeadDetailModal from './lead-table/LeadDetailModal';

interface AdminLeadTableProps {
  leads: Lead[];
  onLeadDeleted?: () => void;
  onLeadRefunded?: () => void;
  onLeadMarkedPaid?: () => void;
}

const AdminLeadTable: React.FC<AdminLeadTableProps> = ({ 
  leads, 
  onLeadDeleted,
  onLeadRefunded,
  onLeadMarkedPaid
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  const [isMarkPaidDialogOpen, setIsMarkPaidDialogOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const { deleteLead, isDeleting } = useAdminLeadDelete();
  const { refundLead, isRefunding } = useAdminLeadRefund();
  const { markLeadAsPaid, isMarkingPaid } = useAdminLeadMarkPaid();

  const handleDeleteClick = (lead: Lead) => {
    setSelectedLead(lead);
    setIsDeleteDialogOpen(true);
  };

  const handleRefundClick = (lead: Lead) => {
    setSelectedLead(lead);
    setIsRefundDialogOpen(true);
  };

  const handleMarkPaidClick = (lead: Lead) => {
    setSelectedLead(lead);
    setIsMarkPaidDialogOpen(true);
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

  const confirmMarkPaidLead = async () => {
    if (selectedLead) {
      const success = await markLeadAsPaid(selectedLead.id);
      if (success && onLeadMarkedPaid) {
        onLeadMarkedPaid();
      }
      setIsMarkPaidDialogOpen(false);
    }
  };

  return (
    <>
      <LeadTable 
        leads={leads} 
        onDeleteClick={handleDeleteClick} 
        onRefundClick={handleRefundClick}
        onMarkPaidClick={handleMarkPaidClick}
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

      <MarkPaidDialog 
        isOpen={isMarkPaidDialogOpen} 
        onClose={() => setIsMarkPaidDialogOpen(false)} 
        onConfirm={confirmMarkPaidLead} 
        isMarkingPaid={isMarkingPaid} 
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
