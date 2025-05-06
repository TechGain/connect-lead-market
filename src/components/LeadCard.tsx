
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import StarRating from '@/components/StarRating';
import { formatCurrency, formatLeadType } from '@/lib/utils';
import { Lead } from '@/types/lead';
import { MapPin, Calendar, Check, X } from 'lucide-react';
import { format } from 'date-fns';

interface LeadCardProps {
  lead: Lead;
  onPurchase?: (lead: Lead) => void;
  showFullDetails?: boolean;
  isPurchased?: boolean;
}

const LeadCard = ({ lead, onPurchase, showFullDetails = false, isPurchased = false }: LeadCardProps) => {
  const isSold = lead.status === 'sold';
  
  // Format date for display
  const formattedDate = lead.createdAt ? format(new Date(lead.createdAt), 'MMM d, yyyy h:mm a') : 'Unknown date';
  
  // Determine confirmation status display
  const isConfirmed = lead.confirmationStatus === 'confirmed';
  
  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow relative">
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
          {/* Display upload date with calendar icon */}
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="h-4 w-4 mr-1" />
            <span>Added: {formattedDate}</span>
          </div>
          
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
            // Limited view - only show firstName and confirmation status for marketplace
            <div className="space-y-2">
              <p className="text-gray-700"><span className="font-medium">First Name:</span> {lead.firstName || 'Unknown'}</p>
              <p className="text-gray-700"><span className="font-medium">Lead Type:</span> {formatLeadType(lead.type)}</p>
              <p className="text-gray-700"><span className="font-medium">ZIP Code:</span> {lead.zipCode || 'Unknown'}</p>
              
              {/* Display confirmation status with icon */}
              <div className="flex items-center">
                <span className="font-medium text-gray-700 mr-2">Status:</span>
                {isConfirmed ? (
                  <span className="flex items-center text-green-600">
                    <Check className="h-4 w-4 mr-1" />
                    Confirmed
                  </span>
                ) : (
                  <span className="flex items-center text-amber-600">
                    <X className="h-4 w-4 mr-1" />
                    Unconfirmed
                  </span>
                )}
              </div>
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
