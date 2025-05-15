
import React from 'react';
import { Calendar, User } from 'lucide-react';
import { format } from 'date-fns';

interface LeadCardMetadataProps {
  createdAt?: string;
  sellerName?: string;
  showFullDetails: boolean;
}

const LeadCardMetadata: React.FC<LeadCardMetadataProps> = ({ 
  createdAt, 
  sellerName,
  showFullDetails 
}) => {
  // Format date for display
  const formattedDate = createdAt ? format(new Date(createdAt), 'MMM d, yyyy h:mm a') : 'Unknown date';
  
  return (
    <div className="space-y-3">
      {/* Display upload date with calendar icon */}
      <div className="flex items-center text-sm text-gray-500">
        <Calendar className="h-4 w-4 mr-1" />
        <span>Added: {formattedDate}</span>
      </div>

      {/* Only display seller info in full details view, not in marketplace */}
      {sellerName && showFullDetails && (
        <div className="flex items-center text-sm text-gray-500">
          <User className="h-4 w-4 mr-1" />
          <span>Seller: {sellerName}</span>
        </div>
      )}
    </div>
  );
};

export default LeadCardMetadata;
