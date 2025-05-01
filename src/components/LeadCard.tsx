
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { StarRating } from '@/components/StarRating';
import { formatCurrency } from '@/lib/utils';
import { Lead } from '@/types/lead';
import { MapPin } from 'lucide-react';

interface LeadCardProps {
  lead: Lead;
  onPurchase?: (lead: Lead) => void;
  showFullDetails?: boolean;
}

const LeadCard = ({ lead, onPurchase, showFullDetails = false }: LeadCardProps) => {
  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-lg">{lead.type}</h3>
            <div className="flex items-center text-gray-500 mt-1">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{lead.location}</span>
            </div>
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
                    <p><span className="font-medium">Address:</span> {lead.address}</p>
                    {lead.appointmentTime && (
                      <p>
                        <span className="font-medium">Appointment:</span> {new Date(lead.appointmentTime).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            // Limited view - only show description and no contact info
            <p className="text-gray-700 line-clamp-3">{lead.description}</p>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-2 border-t flex justify-between items-center">
        <div className="flex items-center">
          <StarRating rating={lead.qualityRating} showValue />
        </div>
        
        <div className="flex items-center">
          <div className="mr-4">
            <span className="font-bold text-lg">{formatCurrency(lead.price)}</span>
          </div>
          
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
