
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Lead } from '@/types/lead';
import { format } from 'date-fns'; // Import format properly from date-fns
import { isAppointmentPassed } from '@/lib/utils';

export const useEditLead = (lead: Lead | null, onLeadUpdated: () => void, onClose: () => void) => {
  const [leadType, setLeadType] = useState('');
  const [description, setDescription] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactPhone2, setContactPhone2] = useState('');
  const [price, setPrice] = useState('');
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
      setDescription(leadData.description || '');
      setContactName(leadData.contactName || '');
      setContactEmail(leadData.contactEmail || '');
      
      // Handle contact phone - split if it contains " / "
      const phoneString = leadData.contactPhone || '';
      if (phoneString.includes(' / ')) {
        const [phone1, phone2] = phoneString.split(' / ');
        setContactPhone(phone1 || '');
        setContactPhone2(phone2 || '');
      } else {
        setContactPhone(phoneString);
        setContactPhone2('');
      }
      
      setPrice(leadData.price?.toString() || '');
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
    
    // Updated required fields to exclude email and contactPhone2
    const requiredFields = [leadType, description, contactName, contactPhone, price, address, zipCode];
    
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
        try {
          // Use the properly imported format function
          appointmentInfo = format(appointmentDate, 'PPP') + ' at ' + appointmentTimeSlot;
        } catch (e) {
          console.error("Failed to format appointment date", e);
          toast.error("Error formatting the appointment date");
          setIsUpdating(false);
          return;
        }
      }
      
      // Extract location from address
      const location = address.split(',').slice(-2).join(',').trim();
      
      // Create contact phone string with optional second number
      let contactPhoneString = contactPhone;
      if (contactPhone2.trim()) {
        contactPhoneString += ` / ${contactPhone2}`;
      }
      
      // Determine the appropriate status
      // If the lead was erased (due to passed appointment) and now has a future appointment,
      // restore it to 'new' status
      let newStatus = lead.status;
      if (lead.status === 'erased' && confirmationStatus === 'confirmed' && appointmentDate) {
        // Check if the new appointment time is in the future
        const newAppointmentInfo = format(appointmentDate, 'PPP') + ' at ' + appointmentTimeSlot;
        if (!isAppointmentPassed(newAppointmentInfo)) {
          // Restore the lead to 'new' status since it has a future appointment now
          newStatus = 'new';
          console.log('Restoring erased lead to new status due to future appointment');
        }
      }
      
      // Update lead in database
      const { error } = await supabase
        .from('leads')
        .update({
          type: leadType,
          location: location, // Set location based on address
          description: description,
          contact_name: contactName,
          contact_email: contactEmail,
          contact_phone: contactPhoneString,
          price: parseFloat(price),
          quality_rating: null, // Set to null instead of using a number
          address: address,
          zip_code: zipCode,
          confirmation_status: confirmationStatus,
          appointment_time: appointmentInfo,
          status: newStatus, // Use the determined status
          created_at: new Date().toISOString(), // Update the created_at field to the current timestamp
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
    description,
    contactName, 
    contactEmail,
    contactPhone,
    contactPhone2,
    price,
    appointmentDate,
    appointmentTimeSlot,
    address,
    zipCode,
    confirmationStatus,
    isUpdating,
    timeSlots,
    setLeadType,
    setDescription,
    setContactName,
    setContactEmail,
    setContactPhone,
    setContactPhone2,
    setPrice,
    setAppointmentDate,
    setAppointmentTimeSlot,
    setAddress,
    setZipCode,
    updateFormWithLead,
    handleConfirmationStatusChange,
    handleSubmit
  };
};
