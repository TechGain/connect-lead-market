
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Pencil, Trash2, RefreshCcw, RotateCcw } from 'lucide-react';
import { Lead } from '@/types/lead';
import { generateGoogleCalendarUrl } from '@/lib/utils';
import { useRefundRequest } from '@/hooks/use-refund-request';
import RefundRequestDialog from '@/components/refund/RefundRequestDialog';

interface LeadCardActionsProps {
  lead: Lead;
  isOwner: boolean;
  onEdit?: (lead: Lead) => void;
  onDelete?: (lead: Lead) => void;
  onRate?: (lead: Lead) => void;
  isPurchased?: boolean;
}

const LeadCardActions: React.FC<LeadCardActionsProps> = ({
  lead,
  isOwner,
  onEdit,
  onDelete,
  onRate,
  isPurchased = false
}) => {
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [existingRefundRequest, setExistingRefundRequest] = useState<any>(null);
  const { checkExistingRequest } = useRefundRequest();

  // Check for existing refund request when component mounts
  useEffect(() => {
    if (isPurchased && lead.status === 'sold') {
      checkExistingRequest(lead.id).then(setExistingRefundRequest);
    }
  }, [lead.id, isPurchased, lead.status, checkExistingRequest]);

  // Check if lead can be edited/deleted
  const isErased = lead.status === 'erased';
  const canEditLead = isOwner && !['sold', 'paid', 'refunded'].includes(lead.status);
  const canDeleteLead = isOwner; // Allow deletion even for erased leads

  // Generate calendar link if lead has appointment time
  const handleAddToCalendar = () => {
    if (!lead.appointmentTime) return null;
    
    // Format lead details for the calendar event
    const eventTitle = `Lead Appointment: ${lead.type}`;
    
    // Create a detailed description with contact information
    let description = `Lead details:\n`;
    if (lead.description) description += `\nDescription: ${lead.description}`;
    if (lead.contactName) description += `\nContact: ${lead.contactName}`;
    if (lead.contactPhone) description += `\nPhone: ${lead.contactPhone}`;
    if (lead.contactEmail) description += `\nEmail: ${lead.contactEmail}`;
    
    // Use the full address for the location if available
    const location = lead.address || lead.location;
    
    // Generate the URL
    const calendarUrl = generateGoogleCalendarUrl(
      lead.appointmentTime,
      eventTitle,
      description,
      location
    );
    
    // Open the URL in a new tab if successfully generated
    if (calendarUrl) {
      window.open(calendarUrl, '_blank');
    }
  };

  // Only show the Add to Calendar button for purchased leads with appointment times
  const showCalendarButton = isPurchased && lead.appointmentTime;

  // Show refund request button for purchased leads that haven't been refunded
  const showRefundButton = isPurchased && 
    lead.status === 'sold' && 
    !existingRefundRequest;

  // Show refund request status if there's an existing request
  const getRefundStatus = () => {
    if (!existingRefundRequest) return null;
    
    const statusColors = {
      pending: 'text-yellow-600',
      approved: 'text-green-600', 
      denied: 'text-red-600'
    };
    
    return (
      <span className={`text-xs px-2 py-1 rounded-full bg-gray-100 ${statusColors[existingRefundRequest.status as keyof typeof statusColors]}`}>
        Refund {existingRefundRequest.status}
      </span>
    );
  };
  
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {isPurchased && (
        <>
          {onRate && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRate(lead)}
            >
              Rate This Lead
            </Button>
          )}
          
          {showCalendarButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddToCalendar}
              className="flex items-center gap-1"
              title="Add to Google Calendar"
            >
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Add to Calendar</span>
            </Button>
          )}

          {showRefundButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRefundDialogOpen(true)}
              className="flex items-center gap-1 text-orange-600 border-orange-600 hover:bg-orange-50"
              title="Request Refund"
            >
              <RotateCcw className="h-4 w-4" />
              <span className="hidden sm:inline">Request Refund</span>
            </Button>
          )}

          {getRefundStatus()}
        </>
      )}
      
      {/* Show edit button for all editable leads, including erased ones */}
      {canEditLead && onEdit && (
        <Button
          variant="ghost"
          size="sm"
          className="p-1 h-auto"
          onClick={() => onEdit(lead)}
          title={isErased ? "Edit & Reactivate Lead" : "Edit Lead"}
        >
          {isErased ? <RefreshCcw className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
        </Button>
      )}
      
      {/* Show delete button for all leads, but change text for erased ones */}
      {canDeleteLead && onDelete && (
        <Button
          variant="ghost"
          size="sm"
          className="p-1 h-auto text-red-500 hover:text-red-700 hover:bg-red-50"
          onClick={() => onDelete(lead)}
          title={isErased ? "Delete Permanently" : "Delete Lead"}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}

      <RefundRequestDialog 
        open={refundDialogOpen}
        onOpenChange={setRefundDialogOpen}
        lead={lead}
      />
    </div>
  );
};

export default LeadCardActions;
