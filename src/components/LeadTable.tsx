
import React, { useState } from 'react';
import { Lead } from '@/types/lead';
import LeadCard from './LeadCard';
import EditLeadModal from './EditLeadModal'; // Import the new EditLeadModal component

interface LeadTableProps {
  leads: Lead[];
}

const LeadTable: React.FC<LeadTableProps> = ({ leads }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  
  const handleEditLead = (lead: Lead) => {
    setSelectedLead(lead);
    setIsEditModalOpen(true);
  };

  const handleLeadUpdated = () => {
    // This will trigger a refresh of the leads list through parent components
    window.location.reload(); // A simple solution - in a real app, we might use state management
  };
  
  if (!leads || leads.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">You haven't uploaded any leads yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {leads.map((lead) => (
          <LeadCard 
            key={lead.id} 
            lead={lead}
            showFullDetails={true}
            isOwner={true}
            onEdit={handleEditLead}
          />
        ))}
      </div>
      
      <EditLeadModal 
        lead={selectedLead} 
        open={isEditModalOpen} 
        onOpenChange={setIsEditModalOpen}
        onLeadUpdated={handleLeadUpdated}
      />
    </>
  );
};

export default LeadTable;
