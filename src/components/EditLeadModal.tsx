
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Lead } from '@/types/lead';
import { supabase } from '@/integrations/supabase/client';

// Import our lead uploader form components
import LeadDetailsFields from './lead-uploader/LeadDetailsFields';
import ConfirmationStatusSelect from './lead-uploader/ConfirmationStatusSelect';
import AppointmentSelector from './lead-uploader/AppointmentSelector';
import ContactInfoFields from './lead-uploader/ContactInfoFields';
import PriceQualityFields from './lead-uploader/PriceQualityFields';

interface EditLeadModalProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLeadUpdated: () => void;
}

const EditLeadModal = ({ lead, open, onOpenChange, onLeadUpdated }: EditLeadModalProps) => {
  const [leadType, setLeadType] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [price, setPrice] = useState('');
  const [quality, setQuality] = useState(3);
  const [appointmentDate, setAppointmentDate] = useState<Date | undefined>(undefined);
  const [appointmentTimeSlot, setAppointmentTimeSlot] = useState('');
  const [address, setAddress] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [confirmationStatus, setConfirmationStatus] = useState<'confirmed' | 'unconfirmed'>('confirmed');
  
  const [isUpdating, setIsUpdating] = useState(false);

  // Generate time slots in 2-hour windows (8 AM to 6 PM)
  const timeSlots = [
    '8:00 AM - 10:00 AM',
    '10:00 AM - 12:00 PM',
    '12:00 PM - 2:00 PM',
    '2:00 PM - 4:00 PM',
    '4:00 PM - 6:00 PM',
  ];

  // Populate form with lead data when it changes
  useEffect(() => {
    if (lead) {
      setLeadType(lead.type || '');
      setLocation(lead.location || '');
      setDescription(lead.description || '');
      setContactName(lead.contactName || '');
      setContactEmail(lead.contactEmail || '');
      setContactPhone(lead.contactPhone || '');
      setPrice(lead.price?.toString() || '');
      setQuality(lead.qualityRating || 3);
      setAddress(lead.address || '');
      setZipCode(lead.zipCode || '');
      setConfirmationStatus(lead.confirmationStatus || 'confirmed');
      
      // Handle appointment date and time
      if (lead.appointmentTime) {
        // Try to extract date from appointment string
        const dateMatch = lead.appointmentTime.match(/^(.*?) at /);
        if (dateMatch && dateMatch[1]) {
          try {
            // This is a simple approach - might need more sophisticated parsing
            const datePart = new Date(dateMatch[1]);
            if (!isNaN(datePart.getTime())) {
              setAppointmentDate(datePart);
            }
          } catch (e) {
            console.error("Failed to parse appointment date", e);
          }
        }
        
        // Try to extract time slot from appointment string
        const timeMatch = lead.appointmentTime.match(/ at (.*?)$/);
        if (timeMatch && timeMatch[1]) {
          setAppointmentTimeSlot(timeMatch[1]);
        }
      }
    }
  }, [lead]);

  const handleConfirmationStatusChange = (value: 'confirmed' | 'unconfirmed') => {
    setConfirmationStatus(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!lead?.id) {
      toast.error("Lead ID is missing");
      return;
    }
    
    const requiredFields = [leadType, location, description, contactName, contactEmail, price, address, zipCode];
    
    // If confirmed, also require appointment date and time
    if (confirmationStatus === 'confirmed' && (!appointmentDate || !appointmentTimeSlot)) {
      toast.error("Appointment date and time are required for confirmed leads");
      return;
    }
    
    if (requiredFields.some(field => !field)) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    try {
      setIsUpdating(true);
      
      // Only include appointment info if the lead is confirmed
      let appointmentInfo = '';
      if (confirmationStatus === 'confirmed' && appointmentDate) {
        const format = require('date-fns/format');
        appointmentInfo = format(appointmentDate, 'PPP') + ' at ' + appointmentTimeSlot;
      }
      
      // Update lead in database
      const { error } = await supabase
        .from('leads')
        .update({
          type: leadType,
          location: location,
          description: description,
          contact_name: contactName,
          contact_email: contactEmail,
          contact_phone: contactPhone,
          price: parseFloat(price),
          quality_rating: quality,
          address: address,
          zip_code: zipCode,
          confirmation_status: confirmationStatus,
          appointment_time: appointmentInfo,
        })
        .eq('id', lead.id);
        
      if (error) {
        throw error;
      }
      
      toast.success("Lead updated successfully");
      onOpenChange(false);
      onLeadUpdated();
    } catch (error) {
      console.error('Error updating lead:', error);
      toast.error('Failed to update lead');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Lead</DialogTitle>
          <DialogDescription>
            Update the details of your lead
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <LeadDetailsFields
            leadType={leadType}
            location={location}
            description={description}
            address={address}
            zipCode={zipCode}
            onLeadTypeChange={setLeadType}
            onLocationChange={setLocation}
            onDescriptionChange={setDescription}
            onAddressChange={setAddress}
            onZipCodeChange={setZipCode}
          />
          
          <ConfirmationStatusSelect 
            value={confirmationStatus} 
            onChange={handleConfirmationStatusChange}
          />
          
          {confirmationStatus === 'confirmed' && (
            <AppointmentSelector
              date={appointmentDate}
              timeSlot={appointmentTimeSlot}
              onDateChange={setAppointmentDate}
              onTimeSlotChange={setAppointmentTimeSlot}
              timeSlots={timeSlots}
            />
          )}
          
          <ContactInfoFields
            contactName={contactName}
            contactEmail={contactEmail}
            contactPhone={contactPhone}
            onContactNameChange={setContactName}
            onContactEmailChange={setContactEmail}
            onContactPhoneChange={setContactPhone}
          />
          
          <PriceQualityFields
            price={price}
            quality={quality}
            onPriceChange={setPrice}
            onQualityChange={setQuality}
          />
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isUpdating}
            >
              {isUpdating ? 'Updating...' : 'Update Lead'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditLeadModal;
