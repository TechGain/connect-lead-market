
import React from 'react';
import { Lead } from '@/types/lead';
import LeadTable from '@/components/LeadTable';
import { useSellerLeads } from '@/hooks/use-seller-leads';
import { useUserRole } from '@/hooks/use-user-role';

interface LeadsListTabProps {
  leads: Lead[];
  role: string | null;
  isAdmin: boolean;
}

const LeadsListTab: React.FC<LeadsListTabProps> = ({ leads, role, isAdmin }) => {
  const { user } = useUserRole();
  const { refreshLeads } = useSellerLeads(user?.id);
  
  const handleLeadUpdated = () => {
    if (user?.id) {
      refreshLeads(user.id);
    }
  };
  
  return (
    <div className="py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">My Leads</h2>
        <p className="text-gray-600">
          {role === 'seller' || isAdmin ? 
            'Here are the leads that you have uploaded.' : 
            'You need to be a seller to upload leads.'}
        </p>
      </div>
      
      <LeadTable 
        leads={leads} 
        onLeadUpdated={handleLeadUpdated}
      />
    </div>
  );
};

export default LeadsListTab;
