
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Lead } from '@/types/lead';

export const useEditLead = (lead: Lead | null, onLeadUpdated: () => void, onClose: () => void) => {
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

  // Update form fields when lead changes
  const updateFormWithLead = (leadData: Lead | null) => {
    if (leadData) {
      setLeadType(leadData.type || '');
      setLocation(leadData.location || '');
      setDescription(leadData.description || '');
      setContactName(leadData.contactName || '');
      setContactEmail(leadData.contactEmail || '');
      setContactPhone(leadData.contactPhone || '');
      setPrice(leadData.price?.toString() || '');
      setQuality(leadData.qualityRating || 3);
      setAddress(leadData.address || '');
      setZipCode(leadData.zipCode || '');
      setConfirmationStatus(leadData.confirmationStatus || 'confirmed');
      
      // Handle appointment date and time
      if (leadData.appointmentTime) {
        // Try to extract date from appointment string
        const dateMatch = leadData.appointmentTime.match(/^(.*?) at /);
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
        const timeMatch = leadData.appointmentTime.match(/ at (.*?)$/);
        if (timeMatch && timeMatch[1]) {
          setAppointmentTimeSlot(timeMatch[1]);
        }
      }
    }
  };

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
      onClose();
      onLeadUpdated();
    } catch (error) {
      console.error('Error updating lead:', error);
      toast.error('Failed to update lead');
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    leadType,
    location,
    description,
    contactName, 
    contactEmail,
    contactPhone,
    price,
    quality,
    appointmentDate,
    appointmentTimeSlot,
    address,
    zipCode,
    confirmationStatus,
    isUpdating,
    timeSlots,
    setLeadType,
    setLocation,
    setDescription,
    setContactName,
    setContactEmail,
    setContactPhone,
    setPrice,
    setQuality,
    setAppointmentDate,
    setAppointmentTimeSlot,
    setAddress,
    setZipCode,
    updateFormWithLead,
    handleConfirmationStatusChange,
    handleSubmit
  };
};
