import React from 'react';
import { CreditCard } from 'lucide-react';
import { TooltipProvider } from '@/components/ui/tooltip';
const PaymentMethodSelector: React.FC = () => {
  return <div className="bg-gray-50 p-4 rounded-md">
      <h4 className="text-sm font-medium mb-3">Payment Information</h4>
      
      <div className="flex items-center space-x-2 bg-white border rounded p-3">
        <CreditCard className="h-4 w-4" />
        <div className="flex-1">
          <p className="text-sm font-medium">Secure checkout powered by Stripe</p>
          <p className="text-xs text-gray-500">
            You'll be redirected to Stripe's secure checkout where you can choose your preferred payment method.
          </p>
        </div>
      </div>
      
      
      
      <p className="text-xs text-gray-500 mt-4 text-center">
        Your payment information is protected with industry-standard encryption.
      </p>
    </div>;
};
export default PaymentMethodSelector;