
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from "@/components/ui/input";

interface ContactInfoFieldsProps {
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  contactPhone2: string;
  onContactNameChange: (value: string) => void;
  onContactEmailChange: (value: string) => void;
  onContactPhoneChange: (value: string) => void;
  onContactPhone2Change: (value: string) => void;
}

const ContactInfoFields = ({
  contactName,
  contactEmail,
  contactPhone,
  contactPhone2,
  onContactNameChange,
  onContactEmailChange,
  onContactPhoneChange,
  onContactPhone2Change,
}: ContactInfoFieldsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="space-y-2">
        <Label htmlFor="contact-name">Contact Name *</Label>
        <Input
          id="contact-name"
          value={contactName}
          onChange={(e) => onContactNameChange(e.target.value)}
          placeholder="John Doe"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="contact-email">Contact Email</Label>
        <Input
          id="contact-email"
          type="email"
          value={contactEmail}
          onChange={(e) => onContactEmailChange(e.target.value)}
          placeholder="example@email.com"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="contact-phone">Contact Phone *</Label>
        <Input
          id="contact-phone"
          value={contactPhone}
          onChange={(e) => onContactPhoneChange(e.target.value)}
          placeholder="(123) 456-7890"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="contact-phone2">Second Phone (Optional)</Label>
        <Input
          id="contact-phone2"
          value={contactPhone2}
          onChange={(e) => onContactPhone2Change(e.target.value)}
          placeholder="(123) 456-7890"
        />
      </div>
    </div>
  );
};

export default ContactInfoFields;
