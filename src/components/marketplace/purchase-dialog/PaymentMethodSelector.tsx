
import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { CreditCard } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Payment method options
export const PAYMENT_METHODS = {
  CARD: 'card',
  GOOGLE_PAY: 'google_pay',
  APPLE_PAY: 'apple_pay'
};

interface PaymentMethodSelectorProps {
  selectedPaymentMethod: string;
  onPaymentMethodChange: (value: string) => void;
  isAppleDevice: boolean;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedPaymentMethod,
  onPaymentMethodChange,
  isAppleDevice
}) => {
  return (
    <div className="bg-gray-50 p-4 rounded-md">
      <h4 className="text-sm font-medium mb-3">Select Payment Method</h4>
      <RadioGroup 
        value={selectedPaymentMethod} 
        onValueChange={onPaymentMethodChange}
        className="flex flex-col space-y-2"
      >
        <div className="flex items-center space-x-2 bg-white border rounded p-3 hover:bg-gray-50">
          <RadioGroupItem value={PAYMENT_METHODS.CARD} id="card" />
          <label htmlFor="card" className="flex items-center gap-2 text-sm font-medium cursor-pointer flex-1">
            <CreditCard className="h-4 w-4" />
            Credit Card
          </label>
        </div>
        
        <div className="flex items-center space-x-2 bg-white border rounded p-3 hover:bg-gray-50">
          <RadioGroupItem value={PAYMENT_METHODS.GOOGLE_PAY} id="google_pay" />
          <label htmlFor="google_pay" className="flex items-center gap-2 text-sm font-medium cursor-pointer flex-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48" aria-hidden="true" className="h-5">
              <path fill="#4285F4" d="M24.4 34.7c-5.6 0-10.3-4.5-10.3-10.1 0-5.6 4.7-10.1 10.3-10.1 3.1 0 5.3 1.2 6.9 2.7l-1.9 1.9c-1.2-1.1-2.7-2-5-2-4.1 0-7.3 3.3-7.3 7.5s3.2 7.5 7.3 7.5c2.6 0 4.1-1 5.1-2 0.8-0.8 1.3-1.9 1.5-3.5h-6.6v-2.7h9.3c0.1 0.5 0.2 1.1 0.2 1.7 0 2.1-0.6 4.7-2.4 6.6-1.8 1.9-4.1 2.9-7.1 2.9z"></path>
              <path fill="#EA4335" d="M10.3 27.1c-0.4-1.2-0.7-2.5-0.7-3.9 0-1.3 0.2-2.6 0.7-3.8l0.1-0.3-2.7-2.1-0.1 0.1C6.6 18.8 6 21.1 6 23.6c0 2.5 0.6 4.8 1.7 6.7l2.6-3.2"></path>
              <path fill="#FBBC05" d="M24.4 13.6c2.9 0 4.9 1.3 6.1 2.3l2.6-2.6c-1.9-1.8-4.4-2.9-7.5-2.9-5.6 0-10.6 3.2-13.2 8l2.7 2.1c1.3-3.1 4.5-6.9 9.3-6.9"></path>
              <path fill="#34A853" d="M10.3 20.1l-2.7-2.1c-1.1 1.9-1.7 4.2-1.7 6.7 0 2.4 0.6 4.6 1.7 6.5l2.7-2.1c-0.5-1.2-0.7-2.6-0.7-4 0-1.3 0.2-2.7 0.7-4"></path>
            </svg>
            Google Pay
            <Badge variant="outline" className="ml-2 text-xs">Preferred</Badge>
          </label>
        </div>
        
        {isAppleDevice && (
          <div className="flex items-center space-x-2 bg-white border rounded p-3 hover:bg-gray-50">
            <RadioGroupItem value={PAYMENT_METHODS.APPLE_PAY} id="apple_pay" />
            <label htmlFor="apple_pay" className="flex items-center gap-2 text-sm font-medium cursor-pointer flex-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                <path d="M12 5c-1.6-1-3.5-1-5.3-.2-1.7.8-2.7 2.4-2.7 4.2V16c0 1.8 1 3.4 2.7 4.2 1.8.8 3.7.8 5.3-.2 1.6 1 3.5 1 5.3.2 1.7-.8 2.7-2.4 2.7-4.2V9c0-1.8-1-3.4-2.7-4.2-1.8-.8-3.7-.8-5.3.2z"></path>
                <path d="M9 5v16"></path>
              </svg>
              Apple Pay
            </label>
          </div>
        )}
      </RadioGroup>
      
      <p className="text-xs text-gray-500 mt-2">
        Secure checkout powered by Stripe. Your payment information is protected with industry-standard encryption.
      </p>
    </div>
  );
};

export default PaymentMethodSelector;
