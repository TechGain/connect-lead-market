
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface LeadCardStatusProps {
  status: string;
}

const LeadCardStatus: React.FC<LeadCardStatusProps> = ({ status }) => {
  // Check if lead is sold
  const isSold = status === 'sold' || status === 'pending';
  
  return (
    <Badge variant={isSold ? 'secondary' : 'default'}>
      {isSold ? 'Sold' : 'Available'}
    </Badge>
  );
};

export default LeadCardStatus;
