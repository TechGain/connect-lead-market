
import React from 'react';
import { PhoneOutgoing, Clock } from 'lucide-react';

interface LeadCardDetailsProps {
  description?: string;
  firstName?: string;
  zipCode?: string;
  type: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  address?: string;
  appointmentTime?: string;
  buyerName?: string;
  confirmationStatus?: string;
  status: string;
  showFullDetails: boolean;
}

const LeadCardDetails: React.FC<LeadCardDetailsProps> = ({ 
  description,
  firstName,
  zipCode,
  type,
  contactName,
  contactPhone,
  contactEmail,
  address,
  appointmentTime,
  buyerName,
  confirmationStatus,
  status,
  showFullDetails
}) => {
  // Determine confirmation status display
  const isConfirmed = confirmationStatus === 'confirmed';
  
  if (showFullDetails) {
    return (
      <>
        <p className="text-gray-700">{description}</p>
        
        {status === 'sold' && (
          <div className="border-t border-gray-100 pt-3">
            <h4 className="font-medium mb-2">Contact Information</h4>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Name:</span> {contactName}</p>
              <p><span className="font-medium">Phone:</span> {contactPhone}</p>
              <p><span className="font-medium">Email:</span> {contactEmail}</p>
              {address && (
                <p><span className="font-medium">Address:</span> {address}</p>
              )}
              {zipCode && (
                <p><span className="font-medium">ZIP Code:</span> {zipCode}</p>
              )}
              {appointmentTime && (
                <p>
                  <span className="font-medium">Appointment:</span> {appointmentTime}
                </p>
              )}
              {buyerName && (
                <p><span className="font-medium">Buyer:</span> {buyerName}</p>
              )}
            </div>
          </div>
        )}
      </>
    );
  } else {
    // Limited view for marketplace
    return (
      <div className="space-y-2">
        <p className="text-gray-700"><span className="font-medium">First Name:</span> {firstName || 'Unknown'}</p>
        <p className="text-gray-700"><span className="font-medium">Lead Type:</span> {type}</p>
        <p className="text-gray-700"><span className="font-medium">ZIP Code:</span> {zipCode || 'Unknown'}</p>
        
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
        
        {/* Action prompt for unconfirmed leads with phone icon */}
        {!isConfirmed && (
          <div className="flex items-center text-sm text-amber-600 mt-1 font-medium">
            <PhoneOutgoing className="h-4 w-4 mr-1" />
            <span>Call customer to schedule appointment</span>
          </div>
        )}
        
        {/* Display appointment time if it exists and status is confirmed */}
        {isConfirmed && appointmentTime && (
          <div className="flex items-center text-sm text-green-600 font-medium">
            <Clock className="h-4 w-4 mr-1" />
            <span>Appointment: {appointmentTime}</span>
          </div>
        )}
      </div>
    );
  }
};

export default LeadCardDetails;
