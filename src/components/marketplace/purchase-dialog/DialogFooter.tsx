
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { DialogFooter } from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/utils';

interface PurchaseDialogFooterProps {
  onCancel: () => void;
  onPurchase: () => void;
  isProcessing: boolean;
  price: number | null;
}

const PurchaseDialogFooter: React.FC<PurchaseDialogFooterProps> = ({
  onCancel,
  onPurchase,
  isProcessing,
  price
}) => {
  return (
    <DialogFooter>
      <Button variant="outline" onClick={onCancel} disabled={isProcessing}>
        Cancel
      </Button>
      <Button onClick={onPurchase} disabled={isProcessing}>
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Purchase for ${price !== null ? formatCurrency(price) : '$0.00'}`
        )}
      </Button>
    </DialogFooter>
  );
};

export default PurchaseDialogFooter;
