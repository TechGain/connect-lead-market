
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Lead } from '@/types/lead';
import { useRefundRequest } from '@/hooks/use-refund-request';

interface RefundRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead | null;
}

const RefundRequestDialog: React.FC<RefundRequestDialogProps> = ({
  open,
  onOpenChange,
  lead
}) => {
  const [reason, setReason] = useState('');
  const { submitRefundRequest, isSubmitting } = useRefundRequest();

  const handleSubmit = async () => {
    if (!lead || !reason.trim()) {
      return;
    }

    const success = await submitRefundRequest(lead.id, reason);
    if (success) {
      setReason('');
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    setReason('');
    onOpenChange(false);
  };

  if (!lead) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Request Refund</DialogTitle>
          <DialogDescription>
            Please provide a reason for requesting a refund for this lead. An admin will review your request.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="bg-gray-50 p-3 rounded-md">
            <h4 className="font-medium text-sm text-gray-700 mb-1">Lead Details:</h4>
            <p className="text-sm">{lead.type} - {lead.location}</p>
            <p className="text-sm text-gray-600">Price: ${lead.price}</p>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="reason">Reason for refund request *</Label>
            <Textarea
              id="reason"
              placeholder="Please explain why you are requesting a refund..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[100px]"
              disabled={isSubmitting}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !reason.trim()}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RefundRequestDialog;
