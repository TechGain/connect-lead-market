
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { getConfirmationTimeRemaining } from '@/lib/utils/datetime';
import { Lead } from '@/types/lead';

interface ConfirmationStatusBadgeProps {
  lead: Lead;
}

const ConfirmationStatusBadge: React.FC<ConfirmationStatusBadgeProps> = ({ lead }) => {
  if (lead.confirmationStatus === 'unconfirmed') {
    return (
      <div>
        <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">Unconfirmed</Badge>
        {renderConfirmationTimer(lead)}
      </div>
    );
  }
  
  return <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50">Confirmed</Badge>;
};

// Helper function to render confirmation timer for admin table view
const renderConfirmationTimer = (lead: Lead) => {
  if (lead.confirmationStatus !== 'unconfirmed' || lead.status !== 'sold' || !lead.purchasedAt) {
    return null;
  }

  const timeRemaining = getConfirmationTimeRemaining(lead.purchasedAt);
  if (!timeRemaining) return null;

  const { hours, minutes } = timeRemaining;
  if (hours === 0 && minutes === 0) {
    return (
      <div className="flex items-center text-red-500 text-xs">
        <Clock className="h-3 w-3 mr-1" />
        <span>Expired</span>
      </div>
    );
  }

  return (
    <div className="flex items-center text-amber-600 text-xs">
      <Clock className="h-3 w-3 mr-1" />
      <span>{hours}h {minutes}m left</span>
    </div>
  );
};

export default ConfirmationStatusBadge;
