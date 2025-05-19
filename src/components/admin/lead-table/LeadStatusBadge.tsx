
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface LeadStatusBadgeProps {
  status: string;
  className?: string;
}

const LeadStatusBadge: React.FC<LeadStatusBadgeProps> = ({ status, className }) => {
  // Map each status to appropriate styling and display text
  switch (status) {
    case 'new':
      return <Badge className={cn("bg-green-500 hover:bg-green-600", className)}>New</Badge>;
    case 'pending':
      return <Badge className={cn("bg-yellow-500 hover:bg-yellow-600", className)}>Pending</Badge>;
    case 'sold':
      return <Badge className={cn("bg-blue-500 hover:bg-blue-600", className)}>Sold</Badge>;
    case 'refunded':
      return <Badge variant="outline" className={cn("border-orange-500 text-orange-600", className)}>Refunded</Badge>;
    case 'erased':
      return <Badge variant="destructive" className={className}>Erased</Badge>;
    default:
      return <Badge className={className}>{status}</Badge>;
  }
};

export default LeadStatusBadge;
