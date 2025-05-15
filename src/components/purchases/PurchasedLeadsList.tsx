
import React from 'react';
import { Lead } from '@/types/lead';
import LeadCard from '@/components/LeadCard';

interface PurchasedLeadsListProps {
  leads: Lead[];
  onRate: (lead: Lead) => void;
}

const PurchasedLeadsList: React.FC<PurchasedLeadsListProps> = ({ leads, onRate }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {leads.map(lead => (
        <div key={lead.id} className="relative">
          <LeadCard
            lead={lead}
            showFullDetails={true}
            isPurchased={true}
            onRate={onRate}
          />
        </div>
      ))}
    </div>
  );
};

export default PurchasedLeadsList;
