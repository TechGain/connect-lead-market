
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Lead } from '@/types/lead';
import { useLeadUpload } from '@/hooks/use-lead-upload';
import { format } from "date-fns";

// Import our new components
import LeadDetailsFields from './lead-uploader/LeadDetailsFields';
import ConfirmationStatusSelect from './lead-uploader/ConfirmationStatusSelect';
import AppointmentSelector from './lead-uploader/AppointmentSelector';
import ContactInfoFields from './lead-uploader/ContactInfoFields';
import PriceQualityFields from './lead-uploader/PriceQualityFields';

const LeadUploader = () => {
  const [leadType, setLeadType] = useState('');
  const [description, setDescription] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [price, setPrice] = useState('');
  const [appointmentDate, setAppointmentDate] = useState<Date | undefined>(undefined);
  const [appointmentTimeSlot, setAppointmentTimeSlot] = useState('');
  const [address, setAddress] = useState('');
  const [zipCode, setZipCode] = useState('');
  // Fixed: Use the proper union type instead of string
  const [confirmationStatus, setConfirmationStatus] = useState<'confirmed' | 'unconfirmed'>('confirmed');
  
  const { uploadLead, isUploading } = useLeadUpload();

  // Generate time slots in 2-hour windows (8 AM to 6 PM)
  const timeSlots = [
    '8:00 AM - 10:00 AM',
    '10:00 AM - 12:00 PM',
    '12:00 PM - 2:00 PM',
    '2:00 PM - 4:00 PM',
    '4:00 PM - 6:00 PM',
  ];

  // Handle address selection from autocomplete
  const handleAddressSelect = (selectedAddress: string) => {
    console.log("Address selected in LeadUploader:", selectedAddress);
    setAddress(selectedAddress);
  };

  // Handle ZIP code found from autocomplete
  const handleZipCodeFound = (foundZipCode: string) => {
    console.log("ZIP code found in LeadUploader:", foundZipCode);
    setZipCode(foundZipCode);
  };

  // Fixed: Ensure the confirmationStatus handler uses the proper union type
  const handleConfirmationStatusChange = (value: 'confirmed' | 'unconfirmed') => {
    setConfirmationStatus(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Updated required fields to exclude email
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
      // Only include appointment info if the lead is confirmed
      let appointmentInfo = '';
      if (confirmationStatus === 'confirmed' && appointmentDate) {
        appointmentInfo = format(appointmentDate, 'PPP') + ' at ' + appointmentTimeSlot;
      }
      
      const newLead: Omit<Lead, 'id'> = {
        type: leadType,
        location: address.split(',').slice(-2).join(',').trim(), // Extract location from address
        description,
        contactName,
        contactEmail,
        contactPhone,
        price: Number(price),
        qualityRating: null, // Set to null instead of a number
        status: 'new',
        createdAt: new Date().toISOString(),
        appointmentTime: appointmentInfo,
        address,
        zipCode,
        confirmationStatus, // This is now properly typed
        sellerId: '', // Initialize with empty string, will be set by the upload function
      };
      
      const success = await uploadLead(newLead);
      
      if (success) {
        toast.success("Lead uploaded successfully");
        
        // Reset form
        setLeadType('');
        setDescription('');
        setContactName('');
        setContactEmail('');
        setContactPhone('');
        setPrice('');
        setAppointmentDate(undefined);
        setAppointmentTimeSlot('');
        setAddress('');
        setZipCode('');
        setConfirmationStatus('confirmed');
      }
    } catch (error) {
      console.error('Error submitting lead:', error);
      toast.error('Failed to upload lead');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Upload New Lead</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <LeadDetailsFields
            leadType={leadType}
            description={description}
            address={address}
            zipCode={zipCode}
            onLeadTypeChange={setLeadType}
            onDescriptionChange={setDescription}
            onAddressSelect={handleAddressSelect}
            onZipCodeFound={handleZipCodeFound}
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
            onPriceChange={setPrice}
          />
        </CardContent>
        
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full"
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload Lead'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default LeadUploader;
