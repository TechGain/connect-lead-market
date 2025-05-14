
import React from 'react';
import { Button } from '@/components/ui/button';
import { Lead } from '@/types/lead';
import LeadDetailsFields from '../lead-uploader/LeadDetailsFields';
import ConfirmationStatusSelect from '../lead-uploader/ConfirmationStatusSelect';
import AppointmentSelector from '../lead-uploader/AppointmentSelector';
import ContactInfoFields from '../lead-uploader/ContactInfoFields';
import PriceQualityFields from '../lead-uploader/PriceQualityFields';
import { useEditLead } from '@/hooks/use-edit-lead';

interface EditLeadFormProps {
  lead: Lead | null;
  onClose: () => void;
  onLeadUpdated: () => void;
}

const EditLeadForm = ({ lead, onClose, onLeadUpdated }: EditLeadFormProps) => {
  const {
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
  } = useEditLead(lead, onLeadUpdated, onClose);

  // Update form fields when lead changes
  React.useEffect(() => {
    updateFormWithLead(lead);
  }, [lead]);

  return (
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
        onAddressSelect={setAddress}
        onZipCodeFound={setZipCode}
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
      
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isUpdating}
        >
          {isUpdating ? 'Updating...' : 'Update Lead'}
        </Button>
      </div>
    </form>
  );
};

export default EditLeadForm;
