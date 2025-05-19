
import React from 'react';
import { Badge } from '@/components/ui/badge';
import LeadStatusBadge from '@/components/admin/lead-table/LeadStatusBadge';

interface LeadCardStatusProps {
  status: string;
}

const LeadCardStatus: React.FC<LeadCardStatusProps> = ({ status }) => {
  // We can now simply reuse our LeadStatusBadge component for consistent UI
  return <LeadStatusBadge status={status} />;
};

export default LeadCardStatus;
