
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

interface MarkPaidDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isMarkingPaid: boolean;
}

const MarkPaidDialog: React.FC<MarkPaidDialogProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isMarkingPaid 
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mark Lead as Paid</DialogTitle>
          <DialogDescription>
            Are you sure you want to mark this lead as paid? This indicates that the payment has been successfully processed and completed.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="default" onClick={onConfirm} disabled={isMarkingPaid} className="bg-green-500 hover:bg-green-600">
            {isMarkingPaid ? 'Processing...' : 'Mark as Paid'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MarkPaidDialog;
