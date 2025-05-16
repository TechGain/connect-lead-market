
import React, { useState } from 'react';
import { Lead } from '@/types/lead';
import { formatCurrency, formatLeadType, applyBuyerPriceMarkup } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2, ExternalLink, CreditCard } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

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

// Payment method options
const PAYMENT_METHODS = {
  CARD: 'card',
  GOOGLE_PAY: 'google_pay',
  APPLE_PAY: 'apple_pay'
};

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

  // Check if the user is on an Apple device for Apple Pay
  const isAppleDevice = /Mac|iPhone|iPad|iPod/.test(navigator.platform);
  
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
              
              {/* Payment method selection */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="text-sm font-medium mb-3">Select Payment Method</h4>
                <RadioGroup 
                  value={selectedPaymentMethod} 
                  onValueChange={handlePaymentMethodChange}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2 bg-white border rounded p-3 hover:bg-gray-50">
                    <RadioGroupItem value={PAYMENT_METHODS.CARD} id="card" />
                    <label htmlFor="card" className="flex items-center gap-2 text-sm font-medium cursor-pointer flex-1">
                      <CreditCard className="h-4 w-4" />
                      Credit Card
                    </label>
                  </div>
                  
                  <TooltipProvider>
                    <div className="flex items-center space-x-2 bg-white border rounded p-3 opacity-60 cursor-not-allowed">
                      <RadioGroupItem value={PAYMENT_METHODS.GOOGLE_PAY} id="google_pay" disabled={true} />
                      <label htmlFor="google_pay" className="flex items-center gap-2 text-sm font-medium cursor-not-allowed flex-1 text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48" aria-hidden="true" className="h-5">
                          <path fill="#4285F4" d="M24.4 34.7c-5.6 0-10.3-4.5-10.3-10.1 0-5.6 4.7-10.1 10.3-10.1 3.1 0 5.3 1.2 6.9 2.7l-1.9 1.9c-1.2-1.1-2.7-2-5-2-4.1 0-7.3 3.3-7.3 7.5s3.2 7.5 7.3 7.5c2.6 0 4.1-1 5.1-2 0.8-0.8 1.3-1.9 1.5-3.5h-6.6v-2.7h9.3c0.1 0.5 0.2 1.1 0.2 1.7 0 2.1-0.6 4.7-2.4 6.6-1.8 1.9-4.1 2.9-7.1 2.9z"></path>
                          <path fill="#EA4335" d="M10.3 27.1c-0.4-1.2-0.7-2.5-0.7-3.9 0-1.3 0.2-2.6 0.7-3.8l0.1-0.3-2.7-2.1-0.1 0.1C6.6 18.8 6 21.1 6 23.6c0 2.5 0.6 4.8 1.7 6.7l2.6-3.2"></path>
                          <path fill="#FBBC05" d="M24.4 13.6c2.9 0 4.9 1.3 6.1 2.3l2.6-2.6c-1.9-1.8-4.4-2.9-7.5-2.9-5.6 0-10.6 3.2-13.2 8l2.7 2.1c1.3-3.1 4.5-6.9 9.3-6.9"></path>
                          <path fill="#34A853" d="M10.3 20.1l-2.7-2.1c-1.1 1.9-1.7 4.2-1.7 6.7 0 2.4 0.6 4.6 1.7 6.5l2.7-2.1c-0.5-1.2-0.7-2.6-0.7-4 0-1.3 0.2-2.7 0.7-4"></path>
                        </svg>
                        Google Pay
                        <Badge variant="outline" className="ml-2 bg-gray-100">Coming Soon</Badge>
                      </label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="text-gray-400">
                            <AlertCircle className="h-4 w-4" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="w-[200px] text-xs">Google Pay will be available in a future update.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <div className="flex items-center space-x-2 bg-white border rounded p-3 opacity-60 cursor-not-allowed">
                      <RadioGroupItem value={PAYMENT_METHODS.APPLE_PAY} id="apple_pay" disabled={true} />
                      <label htmlFor="apple_pay" className="flex items-center gap-2 text-sm font-medium cursor-not-allowed text-gray-500 flex-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                          <path d="M12 5c-1.6-1-3.5-1-5.3-.2-1.7.8-2.7 2.4-2.7 4.2V16c0 1.8 1 3.4 2.7 4.2 1.8.8 3.7.8 5.3-.2 1.6 1 3.5 1 5.3.2 1.7-.8 2.7-2.4 2.7-4.2V9c0-1.8-1-3.4-2.7-4.2-1.8-.8-3.7-.8-5.3.2z"></path>
                          <path d="M9 5v16"></path>
                        </svg>
                        Apple Pay
                        <Badge variant="outline" className="ml-2 bg-gray-100">Coming Soon</Badge>
                      </label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="text-gray-400">
                            <AlertCircle className="h-4 w-4" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="w-[200px] text-xs">Apple Pay will be available in a future update.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TooltipProvider>
                </RadioGroup>
                
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
            <Button onClick={handlePurchase} disabled={isProcessing}>
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
