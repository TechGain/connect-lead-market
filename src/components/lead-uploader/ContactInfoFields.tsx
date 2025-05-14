
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from "@/components/ui/input";

interface ContactInfoFieldsProps {
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  onContactNameChange: (value: string) => void;
  onContactEmailChange: (value: string) => void;
  onContactPhoneChange: (value: string) => void;
}

const ContactInfoFields = ({
  contactName,
  contactEmail,
  contactPhone,
  onContactNameChange,
  onContactEmailChange,
  onContactPhoneChange,
}: ContactInfoFieldsProps) => {
  // Enhanced handlers that stop propagation
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation(); // Stop event propagation to prevent refreshes
    onContactNameChange(e.target.value);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation(); // Stop event propagation to prevent refreshes
    onContactEmailChange(e.target.value);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation(); // Stop event propagation to prevent refreshes
    onContactPhoneChange(e.target.value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="space-y-2">
        <Label htmlFor="contact-name">Contact Name *</Label>
        <Input
          id="contact-name"
          value={contactName}
          onChange={handleNameChange}
          placeholder="John Doe"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="contact-email">Contact Email *</Label>
        <Input
          id="contact-email"
          type="email"
          value={contactEmail}
          onChange={handleEmailChange}
          placeholder="example@email.com"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="contact-phone">Contact Phone *</Label>
        <Input
          id="contact-phone"
          value={contactPhone}
          onChange={handlePhoneChange}
          placeholder="(123) 456-7890"
          required
        />
      </div>
    </div>
  );
};

export default ContactInfoFields;
