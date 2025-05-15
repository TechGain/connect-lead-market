
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import StarRating from '@/components/StarRating';
import { formatCurrency, formatLeadType } from '@/lib/utils';
import { Lead } from '@/types/lead';
import { MapPin, Calendar, User, Pencil, Clock, Trash2, PhoneOutgoing } from 'lucide-react';
import { format } from 'date-fns';

interface LeadCardProps {
  lead: Lead;
  onPurchase?: (lead: Lead) => void;
  showFullDetails?: boolean;
  isPurchased?: boolean;
  isOwner?: boolean;
  onEdit?: (lead: Lead) => void;
  onDelete?: (lead: Lead) => void;
}

const LeadCard = ({ 
  lead, 
  onPurchase, 
  showFullDetails = false, 
  isPurchased = false,
  isOwner = false,
  onEdit,
  onDelete
}: LeadCardProps) => {
  // Check if lead is sold explicitly or erased
  const isSold = lead.status === 'sold' || lead.status === 'pending';
  const isErased = lead.status === 'erased';
  
  // Don't render the card at all if it's erased
  if (isErased) {
    return null;
  }
  
  // Format date for display
  const formattedDate = lead.createdAt ? format(new Date(lead.createdAt), 'MMM d, yyyy h:mm a') : 'Unknown date';
  
  // Determine confirmation status display
  const isConfirmed = lead.confirmationStatus === 'confirmed';
  
  return (
    <Card className={`h-full flex flex-col hover:shadow-md transition-shadow relative ${isSold ? 'bg-gray-50' : ''}`}>
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
          <div className="flex items-center gap-2">
            {isOwner && (
              <>
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 h-auto"
                    onClick={() => onEdit(lead)}
                    title="Edit Lead"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 h-auto text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => onDelete(lead)}
                    title="Delete Lead"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </>
            )}
            <Badge variant={isSold ? 'secondary' : 'default'}>
              {isSold ? 'Sold' : 'Available'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="py-2 flex-grow">
        <div className="space-y-3">
          {/* Display upload date with calendar icon */}
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="h-4 w-4 mr-1" />
            <span>Added: {formattedDate}</span>
          </div>

          {/* Only display seller info in full details view, not in marketplace */}
          {lead.sellerName && showFullDetails && (
            <div className="flex items-center text-sm text-gray-500">
              <User className="h-4 w-4 mr-1" />
              <span>Seller: {lead.sellerName}</span>
            </div>
          )}
          
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
                    {lead.buyerName && (
                      <p><span className="font-medium">Buyer:</span> {lead.buyerName}</p>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            // Limited view for marketplace - show firstName and confirmation status
            <div className="space-y-2">
              <p className="text-gray-700"><span className="font-medium">First Name:</span> {lead.firstName || 'Unknown'}</p>
              <p className="text-gray-700"><span className="font-medium">Lead Type:</span> {formatLeadType(lead.type)}</p>
              <p className="text-gray-700"><span className="font-medium">ZIP Code:</span> {lead.zipCode || 'Unknown'}</p>
              
              {/* Display confirmation status without icon */}
              <div className="flex items-center">
                <span className="font-medium text-gray-700 mr-2">Status:</span>
                {isConfirmed ? (
                  <span className="text-green-600">
                    Confirmed
                  </span>
                ) : (
                  <span className="text-amber-600">Unconfirmed</span>
                )}
              </div>
              
              {/* New action prompt for unconfirmed leads with phone icon */}
              {!isConfirmed && (
                <div className="flex items-center text-sm text-amber-600 mt-1">
                  <PhoneOutgoing className="h-4 w-4 mr-1" />
                  <span>Call customer to schedule appointment</span>
                </div>
              )}
              
              {/* Display appointment time if it exists and status is confirmed */}
              {isConfirmed && lead.appointmentTime && (
                <div className="flex items-center text-sm text-green-600 font-medium">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Appointment: {lead.appointmentTime}</span>
                </div>
              )}
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
          {lead.status === 'new' && onPurchase && !isOwner && (
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
