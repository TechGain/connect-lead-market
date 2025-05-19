
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

interface DeleteLeadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

const DeleteLeadDialog: React.FC<DeleteLeadDialogProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isDeleting 
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Lead</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this lead? This action will mark the lead as erased and cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete Lead'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteLeadDialog;
