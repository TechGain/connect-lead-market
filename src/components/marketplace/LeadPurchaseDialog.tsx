
import React from 'react';
import { Lead } from '@/types/lead';
import { formatCurrency, formatLeadType, applyBuyerPriceMarkup } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Loader2, ExternalLink, CreditCard } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface LeadPurchaseDialogProps {
  selectedLead: Lead | null;
  isOpen: boolean;
  isProcessing: boolean;
  redirectingToStripe?: boolean;
  checkoutError?: string | null;
  onClose: () => void;
  onPurchase: () => void;
  stripeUrl?: string | null;
}

const LeadPurchaseDialog: React.FC<LeadPurchaseDialogProps> = ({
  selectedLead,
  isOpen,
  isProcessing,
  redirectingToStripe = false,
  checkoutError,
  onClose,
  onPurchase,
  stripeUrl
}) => {
  // Function to handle manual redirect if automatic redirect fails
  const handleManualRedirect = () => {
    if (stripeUrl) {
      // Use window.top to ensure redirect happens at the top level, not in iframe
      window.top.location.href = stripeUrl;
    }
  };
  
  const displayPrice = selectedLead ? applyBuyerPriceMarkup(selectedLead.price) : 0;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Confirm Lead Purchase</DialogTitle>
          <DialogDescription>
            You're about to purchase this lead. Once confirmed, you'll get full access to the contact information.
          </DialogDescription>
        </DialogHeader>
        
        {redirectingToStripe && (
          <div className="py-8 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <div className="text-center">
              <p className="text-lg font-medium">Redirecting to secure checkout...</p>
              <p className="text-sm text-muted-foreground">Please do not close this window.</p>
              
              {stripeUrl && (
                <Button variant="link" className="mt-4 flex items-center gap-2" onClick={handleManualRedirect}>
                  <ExternalLink className="h-4 w-4" />
                  Click here if not redirected automatically
                </Button>
              )}
            </div>
          </div>
        )}
        
        {!redirectingToStripe && selectedLead && (
          <div className="py-4">
            <div className="space-y-3">
              <div>
                <h3 className="font-medium text-lg">{formatLeadType(selectedLead.type)}</h3>
                <p className="text-gray-500">{selectedLead.location}</p>
              </div>
              
              <p className="text-gray-700">{selectedLead.description}</p>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Lead Price:</span>
                  <span className="font-semibold">{formatCurrency(displayPrice)}</span>
                </div>
              </div>
              
              {/* Payment method information */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                  <CreditCard className="h-4 w-4" />
                  Available Payment Methods
                </h4>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-1.5 bg-white border rounded px-2 py-1">
                    <img src="https://js.stripe.com/v3/fingerprinted/img/googlepay-ac58a6c087e76f3280bc2952a4f9ac5e.svg" 
                         alt="Google Pay" className="h-5" />
                    <span className="text-xs">Google Pay</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white border rounded px-2 py-1">
                    <img src="https://js.stripe.com/v3/fingerprinted/img/applepay-c1bc44bc2e062d67aeb4009e67868eec.svg" 
                         alt="Apple Pay" className="h-5" />
                    <span className="text-xs">Apple Pay</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white border rounded px-2 py-1">
                    <CreditCard className="h-4 w-4" />
                    <span className="text-xs">Credit Card</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Secure checkout powered by Stripe. Your payment information is protected with industry-standard encryption.
                </p>
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
            <Button variant="outline" onClick={onClose} disabled={isProcessing}>
              Cancel
            </Button>
            <Button onClick={onPurchase} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Purchase for ${selectedLead ? formatCurrency(displayPrice) : '$0.00'}`
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LeadPurchaseDialog;
