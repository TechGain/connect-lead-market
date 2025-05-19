
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface LeadStatusBadgeProps {
  status: string;
}

const LeadStatusBadge: React.FC<LeadStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'new':
      return <Badge className="bg-green-500 hover:bg-green-600">New</Badge>;
    case 'pending':
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>;
    case 'sold':
      return <Badge className="bg-blue-500 hover:bg-blue-600">Sold</Badge>;
    case 'refunded':
      return <Badge variant="outline" className="border-orange-500 text-orange-600">Refunded</Badge>;
    case 'erased':
      return <Badge variant="destructive">Erased</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

export default LeadStatusBadge;
