
import React from 'react';
import { Lead } from '@/types/lead';
import LeadCard from '@/components/LeadCard';

interface LargeCardViewProps {
  leads: Lead[];
  onPurchase: (lead: Lead) => void;
}

const LargeCardView: React.FC<LargeCardViewProps> = ({ leads, onPurchase }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {leads.map(lead => (
        <LeadCard
          key={lead.id}
          lead={lead}
          onPurchase={lead.status === 'new' ? onPurchase : undefined}
          showFullDetails={false}
        />
      ))}
    </div>
  );
};

export default LargeCardView;
