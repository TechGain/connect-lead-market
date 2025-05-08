
import React from 'react';
import LeadTable from '@/components/LeadTable';
import { Lead } from '@/types/lead';

interface LeadsListTabProps {
  leads: Lead[];
  role: string | null;
  isAdmin: boolean;
}

const LeadsListTab = ({ leads, role, isAdmin }: LeadsListTabProps) => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">My Leads</h1>
      {(role === 'seller' || isAdmin) ? (
        <LeadTable leads={leads} />
      ) : (
        <p>Only sellers can view their leads here.</p>
      )}
    </div>
  );
};

export default LeadsListTab;
