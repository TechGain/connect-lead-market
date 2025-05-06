
import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ConfirmationStatusSelectProps {
  value: 'confirmed' | 'unconfirmed'; // Changed from string to specific union type
  onChange: (value: 'confirmed' | 'unconfirmed') => void; // Changed from string to specific union type
}

const ConfirmationStatusSelect = ({ value, onChange }: ConfirmationStatusSelectProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="confirmation-status">Confirmation Status *</Label>
      <RadioGroup 
        value={value} 
        onValueChange={onChange} 
        className="flex space-x-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="confirmed" id="confirmed" />
          <Label htmlFor="confirmed">Confirmed</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="unconfirmed" id="unconfirmed" />
          <Label htmlFor="unconfirmed">Unconfirmed</Label>
        </div>
      </RadioGroup>
    </div>
  );
};

export default ConfirmationStatusSelect;
