
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Lead } from '@/types/lead';
import StarRating from './StarRating';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon, Loader2, MapPin } from "lucide-react";
import { useLeadUpload } from '@/hooks/use-lead-upload';
import { useGooglePlacesAutocomplete } from '@/hooks/use-google-places-autocomplete';

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
  
  // New state for address autocompletion
  const [addressInput, setAddressInput] = useState('');
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const addressContainerRef = useRef<HTMLDivElement>(null);
  
  const { uploadLead, isUploading } = useLeadUpload();
  const { 
    predictions, 
    isLoading: isLoadingPredictions, 
    getAddressPredictions,
    getPlaceDetails
  } = useGooglePlacesAutocomplete();

  // Generate time slots in 2-hour windows (8 AM to 6 PM)
  const timeSlots = [
    '8:00 AM - 10:00 AM',
    '10:00 AM - 12:00 PM',
    '12:00 PM - 2:00 PM',
    '2:00 PM - 4:00 PM',
    '4:00 PM - 6:00 PM',
  ];

  // Handle address input changes
  useEffect(() => {
    if (addressInput.trim()) {
      getAddressPredictions(addressInput);
    }
  }, [addressInput, getAddressPredictions]);
  
  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        addressContainerRef.current && 
        !addressContainerRef.current.contains(event.target as Node)
      ) {
        setShowAddressSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleAddressSelect = async (placeId: string, description: string) => {
    try {
      const details = await getPlaceDetails(placeId);
      
      // Update the address fields
      setAddressInput(details.address);
      setAddress(details.address);
      setZipCode(details.zipCode);
      
      // Auto-fill location field if it's empty
      if (!location && details.city && details.state) {
        setLocation(`${details.city}, ${details.state}`);
      }
      
      // Hide suggestions
      setShowAddressSuggestions(false);
    } catch (error) {
      console.error('Error getting place details:', error);
      // Fall back to using the description
      setAddressInput(description);
      setAddress(description);
      setShowAddressSuggestions(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!leadType || !location || !description || !contactName || !contactEmail || !price || 
        !appointmentDate || !appointmentTimeSlot || !address || !zipCode) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    try {
      const appointmentInfo = format(appointmentDate, 'PPP') + ' at ' + appointmentTimeSlot;
      
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
      };
      
      const success = await uploadLead(newLead);
      
      if (success) {
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
        setAddressInput('');
        setZipCode('');
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lead-type">Lead Type *</Label>
              <Select value={leadType} onValueChange={setLeadType} required>
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
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input 
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
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
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide details about the job..."
              rows={3}
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Property Address field with Autocomplete */}
            <div className="space-y-2" ref={addressContainerRef}>
              <Label htmlFor="address">Property Address *</Label>
              <div className="relative">
                <Input
                  id="address"
                  value={addressInput}
                  onChange={(e) => {
                    setAddressInput(e.target.value);
                    setShowAddressSuggestions(true);
                  }}
                  onClick={() => setShowAddressSuggestions(true)}
                  placeholder="123 Main St, City, State"
                  required
                  className="w-full"
                />
                {showAddressSuggestions && addressInput && predictions.length > 0 && (
                  <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg max-h-60 overflow-y-auto">
                    {isLoadingPredictions ? (
                      <div className="p-3 flex items-center justify-center">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span>Loading suggestions...</span>
                      </div>
                    ) : (
                      predictions.map((prediction) => (
                        <button
                          key={prediction.place_id}
                          type="button"
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-start gap-2"
                          onClick={() => handleAddressSelect(prediction.place_id, prediction.description)}
                        >
                          <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                          <span className="line-clamp-2">{prediction.description}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* ZIP Code field */}
            <div className="space-y-2">
              <Label htmlFor="zipCode">ZIP Code *</Label>
              <Input
                id="zipCode"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                placeholder="12345"
                required
                maxLength={10}
                pattern="[0-9]{5}(-[0-9]{4})?"
                title="Enter a valid ZIP code (e.g., 12345 or 12345-6789)"
              />
            </div>
          </div>
          
          {/* Appointment date and time section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Appointment Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !appointmentDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {appointmentDate ? format(appointmentDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={appointmentDate}
                    onSelect={setAppointmentDate}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label>Appointment Time *</Label>
              <Select value={appointmentTimeSlot} onValueChange={setAppointmentTimeSlot}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time slot" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact-name">Contact Name *</Label>
              <Input
                id="contact-name"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
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
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="example@email.com"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contact-phone">Contact Phone</Label>
              <Input
                id="contact-phone"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="(123) 456-7890"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Asking Price ($) *</Label>
              <Input
                id="price"
                type="number"
                min="1"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="49.99"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label>Lead Quality Rating</Label>
              <div className="pt-2">
                <StarRating 
                  rating={quality} 
                  onRatingChange={setQuality} 
                  readOnly={false} 
                  size={24} 
                />
              </div>
            </div>
          </div>
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
