
import React, { useState } from 'react';
import { Lead } from '@/types/lead';
import LeadCard from './LeadCard';
import EditLeadModal from './EditLeadModal';
import { useLeadDelete } from '@/hooks/use-lead-delete';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';

interface LeadTableProps {
  leads: Lead[];
  onLeadUpdated?: () => void;
}

const LeadTable: React.FC<LeadTableProps> = ({ leads, onLeadUpdated }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { deleteLead, isDeleting } = useLeadDelete();
  
  const handleEditLead = (lead: Lead) => {
    setSelectedLead(lead);
    setIsEditModalOpen(true);
  };

  const handleDeleteLead = (lead: Lead) => {
    setSelectedLead(lead);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteLead = async () => {
    if (selectedLead) {
      const success = await deleteLead(selectedLead.id);
      if (success && onLeadUpdated) {
        onLeadUpdated();
      }
      setIsDeleteDialogOpen(false);
    }
  };

  const handleLeadUpdated = () => {
    // This will trigger a refresh of the leads list through parent components
    if (onLeadUpdated) {
      onLeadUpdated();
    } else {
      window.location.reload(); // A simple solution - in a real app, we might use state management
    }
  };
  
  // Filter out erased leads
  const visibleLeads = leads.filter(lead => lead.status !== 'erased');
  
  if (!visibleLeads || visibleLeads.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">You haven't uploaded any leads yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleLeads.map((lead) => (
          <LeadCard 
            key={lead.id} 
            lead={lead}
            showFullDetails={true}
            isOwner={true}
            onEdit={handleEditLead}
            onDelete={handleDeleteLead}
          />
        ))}
      </div>
      
      <EditLeadModal 
        lead={selectedLead} 
        open={isEditModalOpen} 
        onOpenChange={setIsEditModalOpen}
        onLeadUpdated={handleLeadUpdated}
      />
      
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Lead</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this lead? This action cannot be undone.
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

export default LeadTable;
