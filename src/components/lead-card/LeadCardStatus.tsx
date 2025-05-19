
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface LeadCardStatusProps {
  status: string;
}

const LeadCardStatus: React.FC<LeadCardStatusProps> = ({ status }) => {
  // Determine badge variant and text based on status
  const getBadgeDetails = () => {
    switch (status) {
      case 'sold':
      case 'pending':
        return { variant: 'secondary', text: 'Sold' };
      case 'refunded':
        return { variant: 'outline', text: 'Refunded', className: 'border-orange-500 text-orange-600' };
      case 'erased':
        return { variant: 'destructive', text: 'Erased' };
      default:
        return { variant: 'default', text: 'Available' };
    }
  };
  
  const { variant, text, className = '' } = getBadgeDetails();
  
  return (
    <Badge variant={variant as any} className={className}>
      {text}
    </Badge>
  );
};

export default LeadCardStatus;
