
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Lead } from '@/types/lead';
import LeadCard from '@/components/LeadCard';

interface LeadDetailModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
}

const LeadDetailModal: React.FC<LeadDetailModalProps> = ({ 
  lead, 
  isOpen, 
  onClose 
}) => {
  if (!lead) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Lead Details - {lead.type}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <LeadCard
            lead={lead}
            showFullDetails={true}
            isPurchased={lead.status === 'sold'}
            isOwner={false}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeadDetailModal;
