
import React from 'react';
import { Lead } from '@/types/lead';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/components/ui/dialog';

interface LeadPurchaseDialogProps {
  selectedLead: Lead | null;
  isOpen: boolean;
  isProcessing: boolean;
  onClose: () => void;
  onPurchase: () => void;
}

const LeadPurchaseDialog: React.FC<LeadPurchaseDialogProps> = ({
  selectedLead,
  isOpen,
  isProcessing,
  onClose,
  onPurchase
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Confirm Lead Purchase</DialogTitle>
          <DialogDescription>
            You're about to purchase this lead. Once confirmed, you'll get full access to the contact information.
          </DialogDescription>
        </DialogHeader>
        
        {selectedLead && (
          <div className="py-4">
            <div className="space-y-3">
              <div>
                <h3 className="font-medium text-lg">{selectedLead.type}</h3>
                <p className="text-gray-500">{selectedLead.location}</p>
              </div>
              
              <p className="text-gray-700">{selectedLead.description}</p>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Lead Price:</span>
                  <span className="font-semibold">{formatCurrency(selectedLead.price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Quality Rating:</span>
                  <span>{selectedLead.qualityRating} / 5</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button 
            onClick={onPurchase}
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : `Purchase for ${selectedLead ? formatCurrency(selectedLead.price) : '$0.00'}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LeadPurchaseDialog;
