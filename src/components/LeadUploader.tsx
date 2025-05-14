
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Lead } from '@/types/lead';
import { useLeadUpload } from '@/hooks/use-lead-upload';
import { format } from "date-fns";
import { usePreventRefresh } from '@/hooks/use-prevent-refresh';

// Import our components
import LeadDetailsFields from './lead-uploader/LeadDetailsFields';
import ConfirmationStatusSelect from './lead-uploader/ConfirmationStatusSelect';
import AppointmentSelector from './lead-uploader/AppointmentSelector';
import ContactInfoFields from './lead-uploader/ContactInfoFields';
import PriceQualityFields from './lead-uploader/PriceQualityFields';

const LeadUploader = () => {
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
  
  const { uploadLead, isUploading } = useLeadUpload();
  
  // Use our custom hook to prevent refreshes
  usePreventRefresh();

  // Generate time slots in 2-hour windows (8 AM to 6 PM)
  const timeSlots = [
    '8:00 AM - 10:00 AM',
    '10:00 AM - 12:00 PM',
    '12:00 PM - 2:00 PM',
    '2:00 PM - 4:00 PM',
    '4:00 PM - 6:00 PM',
  ];

  // Enhanced handlers with propagation stopping
  const handleAddressSelect = (selectedAddress: string) => {
    console.log("Address selected in LeadUploader:", selectedAddress);
    setAddress(selectedAddress);
  };

  const handleZipCodeFound = (foundZipCode: string) => {
    console.log("ZIP code found in LeadUploader:", foundZipCode);
    setZipCode(foundZipCode);
  };

  const handleConfirmationStatusChange = (value: 'confirmed' | 'unconfirmed') => {
    setConfirmationStatus(value);
  };

  // Disable all form submission default behavior when component mounts
  useEffect(() => {
    // Find the form element and apply prevention
    const form = document.querySelector('form');
    if (form) {
      console.log('Adding submit prevention to upload form');
      const preventFormSubmit = (e: Event) => {
        console.log('Form submission prevented');
        e.preventDefault();
        e.stopPropagation();
        return false;
      };
      
      form.addEventListener('submit', preventFormSubmit, true);
      
      return () => {
        form.removeEventListener('submit', preventFormSubmit, true);
      };
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    // Using both preventDefault and stopPropagation
    if (e) {
      e.preventDefault(); 
      e.stopPropagation();
    }
    
    console.log("Lead uploader form submission intercepted");
    
    const requiredFields = [leadType, location, description, contactName, contactEmail, contactPhone, price, address, zipCode];
    
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
        location,
        description,
        contactName,
        contactEmail,
        contactPhone,
        price: Number(price),
        qualityRating: quality,
        status: 'new',
        createdAt: new Date().toISOString(),
        appointmentTime: appointmentInfo,
        address,
        zipCode,
        confirmationStatus,
        sellerId: '',
      };
      
      console.log('Submitting lead:', newLead);
      const success = await uploadLead(newLead);
      
      if (success) {
        toast.success("Lead uploaded successfully");
        
        // Reset form
        setLeadType('');
        setLocation('');
        setDescription('');
        setContactName('');
        setContactEmail('');
        setContactPhone('');
        setPrice('');
        setQuality(3);
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
      <form 
        onSubmit={(e) => {
          console.log("Form onSubmit triggered");
          e.preventDefault();
          e.stopPropagation();
          handleSubmit(e);
          return false;
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <CardContent className="space-y-4">
          <LeadDetailsFields
            leadType={leadType}
            location={location}
            description={description}
            address={address}
            zipCode={zipCode}
            onLeadTypeChange={setLeadType}
            onLocationChange={setLocation}
            onDescriptionChange={setDescription}
            onAddressChange={handleAddressSelect}
            onZipCodeChange={handleZipCodeFound}
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
        </CardContent>
        
        <CardFooter>
          <Button 
            type="button" 
            className="w-full"
            disabled={isUploading}
            onClick={(e) => {
              // Extra protection on the button click
              e.preventDefault();
              e.stopPropagation();
              console.log('Upload button clicked, handling submit manually');
              handleSubmit(e);
            }}
          >
            {isUploading ? 'Uploading...' : 'Upload Lead'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default LeadUploader;
