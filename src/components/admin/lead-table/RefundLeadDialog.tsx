
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

interface RefundLeadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isRefunding: boolean;
}

const RefundLeadDialog: React.FC<RefundLeadDialogProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isRefunding 
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Refund Lead</DialogTitle>
          <DialogDescription>
            Are you sure you want to mark this lead as refunded? This indicates that the buyer has been refunded for their purchase.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="default" onClick={onConfirm} disabled={isRefunding} className="bg-orange-500 hover:bg-orange-600">
            {isRefunding ? 'Processing...' : 'Mark as Refunded'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RefundLeadDialog;
