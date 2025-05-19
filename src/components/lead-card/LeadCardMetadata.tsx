
import React from 'react';
import { Calendar, User } from 'lucide-react';
import { format } from 'date-fns';

interface LeadCardMetadataProps {
  createdAt?: string;
  sellerName?: string;
  showFullDetails: boolean;
  showOnlyDate?: boolean; // New prop to control what to display
  isPurchased?: boolean; // New prop to check if this is a purchased lead
}

const LeadCardMetadata: React.FC<LeadCardMetadataProps> = ({ 
  createdAt, 
  sellerName,
  showFullDetails,
  showOnlyDate = false, // Default to showing all metadata
  isPurchased = false // Default to not purchased
}) => {
  // Format date for display
  const formattedDate = createdAt ? format(new Date(createdAt), 'MMM d, yyyy h:mm a') : 'Unknown date';
  
  if (showOnlyDate) {
    // Only return the date component when showOnlyDate is true
    return (
      <div className="flex items-center text-sm text-gray-500 mb-2">
        <Calendar className="h-4 w-4 mr-1" />
        <span>Added: {formattedDate}</span>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {/* Only display seller info in full details view, not in marketplace, and not for purchased leads */}
      {sellerName && showFullDetails && !isPurchased && (
        <div className="flex items-center text-sm text-gray-500">
          <User className="h-4 w-4 mr-1" />
          <span>Seller: {sellerName}</span>
        </div>
      )}
    </div>
  );
};

export default LeadCardMetadata;
