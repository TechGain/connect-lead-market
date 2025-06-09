
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
  } = useEditLead(lead, onLeadUpdated, onClose);

  // Update form fields when lead changes
  React.useEffect(() => {
    updateFormWithLead(lead);
  }, [lead]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <LeadDetailsFields
        leadType={leadType}
        description={description}
        address={address}
        zipCode={zipCode}
        onLeadTypeChange={setLeadType}
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
        contactPhone2={contactPhone2}
        onContactNameChange={setContactName}
        onContactEmailChange={setContactEmail}
        onContactPhoneChange={setContactPhone}
        onContactPhone2Change={setContactPhone2}
      />
      
      <PriceQualityFields
        price={price}
        onPriceChange={setPrice}
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
