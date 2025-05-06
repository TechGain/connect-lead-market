
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import StarRating from '@/components/StarRating';
import { formatCurrency, formatLeadType } from '@/lib/utils';
import { Lead } from '@/types/lead';
import { MapPin } from 'lucide-react';

interface LeadCardProps {
  lead: Lead;
  onPurchase?: (lead: Lead) => void;
  showFullDetails?: boolean;
  isPurchased?: boolean;
}

// New SoldOverlay component to show on sold leads
const SoldOverlay: React.FC = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 z-10">
      <div className="transform rotate-12">
        <span className="text-4xl font-extrabold text-red-600 shadow-sm drop-shadow-[0_1.2px_1.2px_rgba(255,255,255,0.8)]">
          SOLD
        </span>
      </div>
    </div>
  );
};

const LeadCard = ({ lead, onPurchase, showFullDetails = false, isPurchased = false }: LeadCardProps) => {
  const isSold = lead.status === 'sold';
  
  return (
    <Card className={`h-full flex flex-col hover:shadow-md transition-shadow relative ${isSold ? 'opacity-90' : ''}`}>
      {/* Render the SOLD overlay when the lead is sold */}
      {isSold && <SoldOverlay />}
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-lg">{formatLeadType(lead.type)}</h3>
            {showFullDetails ? (
              <div className="flex items-center text-gray-500 mt-1">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{lead.location}</span>
              </div>
            ) : (
              <div className="flex items-center text-gray-500 mt-1">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{lead.zipCode || 'Unknown ZIP'}</span>
              </div>
            )}
          </div>
          <Badge variant={lead.status === 'new' ? 'default' : 'secondary'}>
            {lead.status === 'new' ? 'Available' : 'Sold'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="py-2 flex-grow">
        <div className="space-y-3">
          {showFullDetails ? (
            <>
              <p className="text-gray-700">{lead.description}</p>
              
              {lead.status === 'sold' && (
                <div className="border-t border-gray-100 pt-3">
                  <h4 className="font-medium mb-2">Contact Information</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Name:</span> {lead.contactName}</p>
                    <p><span className="font-medium">Phone:</span> {lead.contactPhone}</p>
                    <p><span className="font-medium">Email:</span> {lead.contactEmail}</p>
                    {lead.address && (
                      <p><span className="font-medium">Address:</span> {lead.address}</p>
                    )}
                    {lead.zipCode && (
                      <p><span className="font-medium">ZIP Code:</span> {lead.zipCode}</p>
                    )}
                    {lead.appointmentTime && (
                      <p>
                        <span className="font-medium">Appointment:</span> {lead.appointmentTime}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            // Limited view - only show firstName for marketplace
            <div className="space-y-2">
              <p className="text-gray-700"><span className="font-medium">First Name:</span> {lead.firstName || 'Unknown'}</p>
              <p className="text-gray-700"><span className="font-medium">Lead Type:</span> {formatLeadType(lead.type)}</p>
              <p className="text-gray-700"><span className="font-medium">ZIP Code:</span> {lead.zipCode || 'Unknown'}</p>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-2 border-t flex justify-between items-center">
        <div className="flex items-center">
          <StarRating rating={lead.qualityRating || 0} showValue />
        </div>
        
        <div className="flex items-center">
          <div className="mr-4">
            <span className="font-bold text-lg">{formatCurrency(lead.price)}</span>
          </div>
          
          {/* Only show the Buy Lead button for new leads */}
          {lead.status === 'new' && onPurchase && (
            <Button 
              size="sm" 
              onClick={() => onPurchase(lead)}
            >
              Buy Lead
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default LeadCard;
