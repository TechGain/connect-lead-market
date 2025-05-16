
import React from 'react';
import { Lead } from '@/types/lead';
import { formatLeadType, formatCurrency } from '@/lib/utils';

interface LeadSummaryProps {
  lead: Lead;
  displayPrice: number;
}

const LeadSummary: React.FC<LeadSummaryProps> = ({ 
  lead, 
  displayPrice 
}) => {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="font-medium text-lg">{formatLeadType(lead.type)}</h3>
        <p className="text-gray-500">{lead.location}</p>
      </div>
      
      <p className="text-gray-700">{lead.description}</p>
      
      <div className="bg-gray-50 p-4 rounded-md">
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Lead Price:</span>
          <span className="font-semibold">{formatCurrency(displayPrice)}</span>
        </div>
      </div>
    </div>
  );
};

export default LeadSummary;
