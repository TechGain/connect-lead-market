
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Lead } from '@/types/lead';
import LeadCardHeader from './lead-card/LeadCardHeader';
import LeadCardMetadata from './lead-card/LeadCardMetadata';
import LeadCardDetails from './lead-card/LeadCardDetails';
import LeadCardFooter from './lead-card/LeadCardFooter';
import { formatLeadType } from '@/lib/utils';
import { useUserRole } from '@/hooks/use-user-role';

interface LeadCardProps {
  lead: Lead;
  onPurchase?: (lead: Lead) => void;
  showFullDetails?: boolean;
  isPurchased?: boolean;
  isOwner?: boolean;
  onEdit?: (lead: Lead) => void;
  onDelete?: (lead: Lead) => void;
  onRate?: (lead: Lead) => void;
}

const LeadCard = ({ 
  lead, 
  onPurchase, 
  showFullDetails = false, 
  isPurchased = false,
  isOwner = false,
  onEdit,
  onDelete,
  onRate
}: LeadCardProps) => {
  // Get the current user's role
  const { role } = useUserRole();
  
  // Check if lead is sold explicitly or erased
  const isSold = lead.status === 'sold' || lead.status === 'pending';
  const isErased = lead.status === 'erased';
  
  // Don't render the card at all if it's erased
  if (isErased) {
    return null;
  }
  
  return (
    <Card className={`h-full flex flex-col hover:shadow-md transition-shadow relative ${isSold ? 'bg-gray-50' : ''}`}>
      {/* Show date at the top of the card */}
      <div className="px-6 pt-6 pb-0">
        <LeadCardMetadata
          createdAt={lead.createdAt}
          showFullDetails={showFullDetails}
          showOnlyDate={true}
        />
      </div>
      
      <CardHeader className="pb-2">
        <LeadCardHeader 
          lead={lead}
          showFullDetails={showFullDetails}
          isOwner={isOwner}
          onEdit={onEdit}
          onDelete={onDelete}
          onRate={onRate}
          isPurchased={isPurchased}
        />
      </CardHeader>
      
      <CardContent className="py-2 flex-grow">
        {/* Keep the original LeadCardMetadata but without date (it's moved to top) */}
        <div className="mb-3">
          <LeadCardMetadata 
            sellerName={lead.sellerName}
            showFullDetails={showFullDetails}
            isPurchased={isPurchased} // Pass the isPurchased prop
          />
        </div>
        
        <LeadCardDetails
          description={lead.description}
          firstName={lead.firstName}
          zipCode={lead.zipCode}
          type={formatLeadType(lead.type)}
          contactName={lead.contactName}
          contactPhone={lead.contactPhone}
          contactEmail={lead.contactEmail}
          address={lead.address}
          appointmentTime={lead.appointmentTime}
          buyerName={lead.buyerName}
          confirmationStatus={lead.confirmationStatus}
          status={lead.status}
          showFullDetails={showFullDetails}
          purchasedAt={lead.purchasedAt}
          viewerRole={role} // Pass the user's role to LeadCardDetails
        />
      </CardContent>
      
      <CardFooter className="pt-2">
        <LeadCardFooter 
          lead={lead} 
          onPurchase={onPurchase}
          isOwner={isOwner}
          isPurchased={isPurchased}
          onRate={onRate}
        />
      </CardFooter>
    </Card>
  );
};

export default LeadCard;
