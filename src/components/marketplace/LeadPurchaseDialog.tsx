
import React from 'react';
import { Lead } from '@/types/lead';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2 } from 'lucide-react';
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
  redirectingToStripe?: boolean;
  checkoutError?: string | null;
  onClose: () => void;
  onPurchase: () => void;
}

const LeadPurchaseDialog: React.FC<LeadPurchaseDialogProps> = ({
  selectedLead,
  isOpen,
  isProcessing,
  redirectingToStripe = false,
  checkoutError,
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
        
        {redirectingToStripe ? (
          <div className="py-8 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <div className="text-center">
              <p className="text-lg font-medium">Redirecting to secure checkout...</p>
              <p className="text-sm text-muted-foreground">Please do not close this window.</p>
            </div>
          </div>
        ) : selectedLead && (
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
              
              {checkoutError && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded flex items-start gap-2 text-sm">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
                  <div>
                    <p className="font-medium">Error</p>
                    <p>{checkoutError}</p>
                    <p className="mt-1 text-xs">Please try again or contact support if this issue persists.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {!redirectingToStripe && (
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
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : `Purchase for ${selectedLead ? formatCurrency(selectedLead.price) : '$0.00'}`}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LeadPurchaseDialog;
