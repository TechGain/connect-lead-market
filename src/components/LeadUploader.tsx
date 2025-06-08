
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
  const [city, setCity] = useState('');
  const [confirmationStatus, setConfirmationStatus] = useState<'confirmed' | 'unconfirmed'>('confirmed');
  
  const { uploadLead, isUploading } = useLeadUpload();

  // Generate comprehensive time slots from 7 AM to 8 PM in 1-hour and 2-hour windows
  const timeSlots = [
    '7:00 AM - 8:00 AM',
    '7:00 AM - 9:00 AM',
    '8:00 AM - 9:00 AM',
    '8:00 AM - 10:00 AM',
    '9:00 AM - 10:00 AM',
    '9:00 AM - 11:00 AM',
    '10:00 AM - 11:00 AM',
    '10:00 AM - 12:00 PM',
    '11:00 AM - 12:00 PM',
    '11:00 AM - 1:00 PM',
    '12:00 PM - 1:00 PM',
    '12:00 PM - 2:00 PM',
    '1:00 PM - 2:00 PM',
    '1:00 PM - 3:00 PM',
    '2:00 PM - 3:00 PM',
    '2:00 PM - 4:00 PM',
    '3:00 PM - 4:00 PM',
    '3:00 PM - 5:00 PM',
    '4:00 PM - 5:00 PM',
    '4:00 PM - 6:00 PM',
    '5:00 PM - 6:00 PM',
    '5:00 PM - 7:00 PM',
    '6:00 PM - 7:00 PM',
    '6:00 PM - 8:00 PM',
    '7:00 PM - 8:00 PM',
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

  // Handle city found from autocomplete
  const handleCityFound = (foundCity: string) => {
    console.log("City found in LeadUploader:", foundCity);
    setCity(foundCity);
  };

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
      
      // Create location string - use city if we have it, otherwise fall back to extracting from address
      let locationString = '';
      if (city && zipCode) {
        // Use the extracted city name with state and ZIP
        const statePart = address.includes(', CA') ? 'CA' : 
                          address.includes(', TX') ? 'TX' : 
                          address.includes(', FL') ? 'FL' : 
                          address.includes(', NY') ? 'NY' : 'USA';
        locationString = `${city}, ${statePart} ${zipCode}`;
      } else {
        // Fallback to extracting from address
        locationString = address.split(',').slice(-2).join(',').trim();
      }
      
      console.log('Creating lead with city:', city, 'and location:', locationString);
      
      const newLead: Omit<Lead, 'id'> = {
        type: leadType,
        location: locationString,
        description,
        contactName,
        contactEmail,
        contactPhone,
        price: Number(price),
        qualityRating: null,
        status: 'new',
        createdAt: new Date().toISOString(),
        appointmentTime: appointmentInfo,
        address,
        zipCode,
        confirmationStatus,
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
        setCity('');
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
            onCityFound={handleCityFound}
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
