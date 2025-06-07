
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Pencil, Trash2 } from 'lucide-react';
import { Lead } from '@/types/lead';
import { generateGoogleCalendarUrl } from '@/lib/utils';

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
  // Check if lead can be edited/deleted (not in post-purchase states)
  const canEditLead = isOwner && !['sold', 'paid', 'refunded'].includes(lead.status);

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
  
  return (
    <div className="flex items-center gap-2">
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
        </>
      )}
      
      {canEditLead && (
        <>
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-auto"
              onClick={() => onEdit(lead)}
              title="Edit Lead"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-auto text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={() => onDelete(lead)}
              title="Delete Lead"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </>
      )}
    </div>
  );
};

export default LeadCardActions;
