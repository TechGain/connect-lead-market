
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AddressAutocompleteInput } from "@/components/ui/address-autocomplete";

interface LeadDetailsFieldsProps {
  leadType: string;
  description: string;
  address: string;
  zipCode: string;
  onLeadTypeChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onAddressSelect: (address: string) => void;
  onZipCodeFound: (zipCode: string) => void;
}

// Define lead types in an array for easy sorting
const leadTypes = [
  { value: 'adu', label: 'ADU' },
  { value: 'air-dryer', label: 'Air Dryer' },
  { value: 'air-duct', label: 'Air Duct' },
  { value: 'bathroom-remodel', label: 'Bathroom Remodel' },
  { value: 'concrete', label: 'Concrete' },
  { value: 'deck', label: 'Deck' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'exterior-paint', label: 'Exterior Paint' },
  { value: 'flooring-services', label: 'Flooring Services' },
  { value: 'foundation-repair', label: 'Foundation Repair' },
  { value: 'full-home-renovation', label: 'Full Home Renovation' },
  { value: 'garage-conversion', label: 'Garage Conversion' },
  { value: 'garage-doors-repair', label: 'Garage Doors Repair' },
  { value: 'home-cleaning', label: 'Home Cleaning' },
  { value: 'hvac', label: 'HVAC' },
  { value: 'insulation-services', label: 'Insulation Services' },
  { value: 'interior-paint', label: 'Interior Paint' },
  { value: 'kitchen-remodel', label: 'Kitchen Remodel' },
  { value: 'landscaping', label: 'Landscaping' },
  { value: 'locksmith-services', label: 'Locksmith Services' },
  { value: 'new-construction', label: 'New Construction' },
  { value: 'patio', label: 'Patio' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'pool-services', label: 'Pool Services' },
  { value: 'roofing', label: 'Roofing' },
  { value: 'sliding-door-repair', label: 'Sliding Door Repair' },
  { value: 'smart-home-services', label: 'Smart Home Services' },
  { value: 'solar', label: 'Solar' },
];

// Sort the lead types alphabetically by label
const sortedLeadTypes = [...leadTypes].sort((a, b) => 
  a.label.localeCompare(b.label)
);

const LeadDetailsFields = ({
  leadType,
  description,
  address,
  zipCode,
  onLeadTypeChange,
  onDescriptionChange,
  onAddressSelect,
  onZipCodeFound,
}: LeadDetailsFieldsProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="lead-type">Lead Type *</Label>
        <Select value={leadType} onValueChange={onLeadTypeChange} required>
          <SelectTrigger id="lead-type">
            <SelectValue placeholder="Select lead type" />
          </SelectTrigger>
          <SelectContent>
            {sortedLeadTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Lead Description *</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Provide details about the job..."
          rows={3}
          required
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="address">Property Address *</Label>
          <AddressAutocompleteInput
            id="address"
            value={address}
            placeholder="Start typing to search for an address..."
            required
            onAddressSelect={onAddressSelect}
            onZipCodeFound={onZipCodeFound}
          />
          <p className="text-xs text-muted-foreground">Start typing to see address suggestions</p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="zipCode">ZIP Code *</Label>
          <Input
            id="zipCode"
            value={zipCode}
            onChange={(e) => onZipCodeFound(e.target.value)}
            placeholder="12345"
            required
            maxLength={10}
            pattern="[0-9]{5}(-[0-9]{4})?"
            title="Enter a valid ZIP code (e.g., 12345 or 12345-6789)"
          />
        </div>
      </div>
    </>
  );
};

export default LeadDetailsFields;
