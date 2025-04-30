
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Lead } from '@/types/lead';
import StarRating from './StarRating';

interface LeadUploaderProps {
  onLeadSubmit: (lead: Omit<Lead, 'id'>) => void;
}

const LeadUploader = ({ onLeadSubmit }: LeadUploaderProps) => {
  const [leadType, setLeadType] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [price, setPrice] = useState('');
  const [quality, setQuality] = useState(3);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!leadType || !location || !description || !contactName || !contactEmail || !price) {
      toast.error("Please fill in all required fields");
      return;
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
      status: 'new' as const, // Explicitly type this as a literal type
      sellerId: 'current-seller-id', // In a real app, this would come from auth context
      createdAt: new Date().toISOString(),
    };
    
    onLeadSubmit(newLead);
    
    // Reset form
    setLeadType('');
    setLocation('');
    setDescription('');
    setContactName('');
    setContactEmail('');
    setContactPhone('');
    setPrice('');
    setQuality(3);
    
    toast.success("Lead submitted successfully!");
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
          <Button type="submit" className="w-full">Upload Lead</Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default LeadUploader;
