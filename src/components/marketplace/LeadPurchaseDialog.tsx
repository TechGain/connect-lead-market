
import React, { useState, useEffect } from 'react';
import { Lead } from '@/types/lead';
import { applyBuyerPriceMarkup } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import LeadSummary from './purchase-dialog/LeadSummary';
import PaymentMethodSelector, { PAYMENT_METHODS } from './purchase-dialog/PaymentMethodSelector';
import ErrorDisplay from './purchase-dialog/ErrorDisplay';
import RedirectState from './purchase-dialog/RedirectState';
import PurchaseDialogFooter from './purchase-dialog/DialogFooter';

interface LeadPurchaseDialogProps {
  selectedLead: Lead | null;
  isOpen: boolean;
  isProcessing: boolean;
  redirectingToStripe?: boolean;
  checkoutError?: string | null;
  onClose: () => void;
  onPurchase: (paymentMethod?: string) => void;
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
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>(PAYMENT_METHODS.CARD);
  const [isAppleDevice, setIsAppleDevice] = useState(false);
  
  // Detect if the user is on an Apple device
  useEffect(() => {
    const checkAppleDevice = () => {
      const isApple = /Mac|iPhone|iPad|iPod/.test(navigator.platform);
      setIsAppleDevice(isApple);
    };
    
    checkAppleDevice();
  }, []);
  
  // Function to handle manual redirect if automatic redirect fails
  const handleManualRedirect = () => {
    if (stripeUrl) {
      // Use window.top to ensure redirect happens at the top level, not in iframe
      window.top.location.href = stripeUrl;
    }
  };
  
  const displayPrice = selectedLead ? applyBuyerPriceMarkup(selectedLead.price) : 0;
  
  // Handle payment method selection
  const handlePaymentMethodChange = (value: string) => {
    setSelectedPaymentMethod(value);
  };
  
  // Handle purchase with selected payment method
  const handlePurchase = () => {
    onPurchase(selectedPaymentMethod);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Confirm Lead Purchase</DialogTitle>
          <DialogDescription>
            You're about to purchase this lead. Once confirmed, you'll get full access to the contact information.
          </DialogDescription>
        </DialogHeader>
        
        {/* Show redirect state when redirecting to Stripe */}
        {redirectingToStripe && (
          <RedirectState 
            stripeUrl={stripeUrl || null} 
            onManualRedirect={handleManualRedirect}
          />
        )}
        
        {/* Show purchase form when not redirecting */}
        {!redirectingToStripe && selectedLead && (
          <div className="py-4">
            <div className="space-y-3">
              <LeadSummary 
                lead={selectedLead}
                displayPrice={displayPrice}
              />
              
              <PaymentMethodSelector
                selectedPaymentMethod={selectedPaymentMethod}
                onPaymentMethodChange={handlePaymentMethodChange}
                isAppleDevice={isAppleDevice}
              />
              
              <ErrorDisplay error={checkoutError || ''} />
            </div>
          </div>
        )}
        
        {/* Dialog footer with action buttons */}
        {!redirectingToStripe && (
          <PurchaseDialogFooter
            onCancel={onClose}
            onPurchase={handlePurchase}
            isProcessing={isProcessing}
            price={selectedLead ? displayPrice : null}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LeadPurchaseDialog;
