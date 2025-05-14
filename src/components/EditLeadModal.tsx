
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Lead } from '@/types/lead';
import EditLeadForm from './lead-editor/EditLeadForm';

interface EditLeadModalProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLeadUpdated: () => void;
}

const EditLeadModal = ({ lead, open, onOpenChange, onLeadUpdated }: EditLeadModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Lead</DialogTitle>
          <DialogDescription>
            Update the details of your lead
          </DialogDescription>
        </DialogHeader>
        
        <EditLeadForm 
          lead={lead} 
          onClose={() => onOpenChange(false)} 
          onLeadUpdated={onLeadUpdated} 
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditLeadModal;
