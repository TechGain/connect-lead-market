
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Lead } from '@/types/lead';
import LeadCardHeader from './lead-card/LeadCardHeader';
import LeadCardMetadata from './lead-card/LeadCardMetadata';
import LeadCardDetails from './lead-card/LeadCardDetails';
import LeadCardFooter from './lead-card/LeadCardFooter';
import { formatLeadType } from '@/lib/utils';
import { useUserRole } from '@/hooks/use-user-role';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';

interface LeadCardProps {
  lead: Lead;
  onPurchase?: (lead: Lead) => void;
  showFullDetails?: boolean;
  isPurchased?: boolean;
  isOwner?: boolean;
  onEdit?: (lead: Lead) => void;
  onDelete?: (lead: Lead) => void;
  onRate?: (lead: Lead) => void;
  adminView?: boolean;
}

const LeadCard = ({ 
  lead, 
  onPurchase, 
  showFullDetails = false, 
  isPurchased = false,
  isOwner = false,
  onEdit,
  onDelete,
  onRate,
  adminView = false
}: LeadCardProps) => {
  // Get the current user's role
  const { role } = useUserRole();
  
  // Check if lead is sold explicitly or erased
  const isSold = lead.status === 'sold' || lead.status === 'pending';
  const isErased = lead.status === 'erased';
  
  // Don't render the card at all if it's erased UNLESS it's in admin view OR the user is the owner
  if (isErased && !adminView && !isOwner) {
    return null;
  }
  
  // Handle reactivating an erased lead
  const handleReactivateLead = () => {
    if (onEdit) {
      onEdit(lead);
    }
  };
  
  return (
    <Card className={`h-full flex flex-col hover:shadow-md transition-shadow relative ${
      isSold ? 'bg-gray-50' : ''
    } ${
      isErased ? 'border-red-300 bg-red-50 opacity-80' : ''
    }`}>
      {/* Show special header for erased leads when owner views them */}
      {isErased && isOwner && (
        <div className="bg-red-100 border-b border-red-200 px-4 py-2 rounded-t-lg">
          <div className="flex items-center justify-between">
            <span className="text-red-700 text-sm font-medium">
              Lead Expired/Erased
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={handleReactivateLead}
              className="h-6 px-2 text-xs bg-white hover:bg-red-50"
            >
              <RefreshCcw className="h-3 w-3 mr-1" />
              Reactivate
            </Button>
          </div>
          <p className="text-red-600 text-xs mt-1">
            Click "Reactivate" or "Edit" to update appointment time and make this lead available again
          </p>
        </div>
      )}
      
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
