
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AddressAutocompleteInput } from "@/components/ui/address-autocomplete";

interface LeadDetailsFieldsProps {
  leadType: string;
  location: string;
  description: string;
  address: string;
  zipCode: string;
  onLeadTypeChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onAddressChange: (value: string) => void;
  onZipCodeChange: (value: string) => void;
}

const LeadDetailsFields = ({
  leadType,
  location,
  description,
  address,
  zipCode,
  onLeadTypeChange,
  onLocationChange,
  onDescriptionChange,
  onAddressChange,
  onZipCodeChange,
}: LeadDetailsFieldsProps) => {
  // Fix: Ensure input handlers don't prevent default behavior
  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onLocationChange(e.target.value);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onDescriptionChange(e.target.value);
  };

  const handleZipCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onZipCodeChange(e.target.value);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="lead-type">Lead Type *</Label>
          <Select value={leadType} onValueChange={onLeadTypeChange} required>
            <SelectTrigger id="lead-type">
              <SelectValue placeholder="Select lead type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="roofing">Roofing</SelectItem>
              <SelectItem value="plumbing">Plumbing</SelectItem>
              <SelectItem value="electrical">Electrical</SelectItem>
              <SelectItem value="hvac">HVAC</SelectItem>
              <SelectItem value="landscaping">Landscaping</SelectItem>
              <SelectItem value="bathroom-remodel">Bathroom Remodel</SelectItem>
              <SelectItem value="kitchen-remodel">Kitchen Remodel</SelectItem>
              <SelectItem value="full-home-renovation">Full Home Renovation</SelectItem>
              <SelectItem value="garage-conversion">Garage Conversion</SelectItem>
              <SelectItem value="new-construction">New Construction</SelectItem>
              <SelectItem value="locksmith-services">Locksmith Services</SelectItem>
              <SelectItem value="garage-doors-repair">Garage Doors Repair</SelectItem>
              <SelectItem value="sliding-door-repair">Sliding Door Repair</SelectItem>
              <SelectItem value="flooring-services">Flooring Services</SelectItem>
              <SelectItem value="home-cleaning">Home Cleaning</SelectItem>
              <SelectItem value="pool-services">Pool Services</SelectItem>
              <SelectItem value="insulation-services">Insulation Services</SelectItem>
              <SelectItem value="smart-home-services">Smart Home Services</SelectItem>
              <SelectItem value="foundation-repair">Foundation Repair</SelectItem>
              <SelectItem value="exterior-paint">Exterior Paint</SelectItem>
              <SelectItem value="interior-paint">Interior Paint</SelectItem>
              <SelectItem value="air-duct">Air Duct</SelectItem>
              <SelectItem value="air-dryer">Air Dryer</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="location">Location *</Label>
          <Input 
            id="location"
            value={location}
            onChange={handleLocationChange}
            placeholder="City, State"
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Lead Description *</Label>
        <Textarea
          id="description"
          value={description}
          onChange={handleDescriptionChange}
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
            onAddressSelect={(selectedAddress) => {
              console.log("Address selected in LeadDetailsFields:", selectedAddress);
              onAddressChange(selectedAddress);
            }}
            onZipCodeFound={(foundZipCode) => {
              console.log("Zip code found in LeadDetailsFields:", foundZipCode);
              onZipCodeChange(foundZipCode);
            }}
          />
          <p className="text-xs text-muted-foreground">Start typing to see address suggestions</p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="zipCode">ZIP Code *</Label>
          <Input
            id="zipCode"
            value={zipCode}
            onChange={handleZipCodeChange}
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
