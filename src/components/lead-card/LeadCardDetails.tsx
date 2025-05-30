
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/format-helpers';
import { isAppointmentPassed } from '@/lib/utils/datetime';
import ConfirmationTimer from './ConfirmationTimer';
interface LeadCardDetailsProps {
  description?: string;
  firstName?: string;
  zipCode?: string;
  type: string;
  price?: number;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  address?: string;
  appointmentTime?: string;
  confirmationStatus?: 'confirmed' | 'unconfirmed';
  status?: string;
  showFullDetails: boolean;
  buyerName?: string | null;
  purchasedAt?: string | null;
  viewerRole?: string | null; // New prop to determine if buyer name should be shown
}
const LeadCardDetails: React.FC<LeadCardDetailsProps> = ({
  description,
  firstName,
  zipCode,
  type,
  price,
  contactName,
  contactPhone,
  contactEmail,
  address,
  appointmentTime,
  confirmationStatus = 'confirmed',
  status,
  showFullDetails = false,
  buyerName,
  purchasedAt,
  viewerRole = null // Default to null
}) => {
  const isAppointmentExpired = appointmentTime ? isAppointmentPassed(appointmentTime) : false;
  const shouldShowBuyerName = buyerName && viewerRole !== 'seller'; // Hide buyer name from sellers

  // Only show limited fields if not full details or description exists
  if (!showFullDetails || !description) {
    return <div className="mt-2">
        {zipCode && <p className="text-gray-600 mb-2">
            <span className="font-semibold">Zip Code:</span> {zipCode}
          </p>}
        {firstName && <p className="text-gray-600 mb-2">
            <span className="font-semibold">Client's Name:</span> {firstName}
          </p>}
        
        {/* Add description in the limited view mode */}
        {description && <p className="text-gray-600 mb-2 line-clamp-2 text-sm">
            <span className="font-semibold">Description:</span> {description}
          </p>}
        
        {/* Display confirmation status for both confirmed and unconfirmed */}
        {confirmationStatus === 'confirmed' && appointmentTime && <div className="mt-1 flex items-center gap-2">
            <Badge className="bg-green-500 hover:bg-green-600 text-white">Confirmed</Badge>
            <span className="text-sm text-gray-600">
              {appointmentTime}
              {isAppointmentExpired && <Badge variant="outline" className="ml-1 text-red-500 border-red-300 bg-red-50 text-xs">Expired</Badge>}
            </span>
          </div>}
        
        {confirmationStatus === 'unconfirmed' && <div className="mt-1">
            <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">Unconfirmed</Badge>
            {purchasedAt && status === 'sold' && <ConfirmationTimer purchasedAt={purchasedAt} />}
          </div>}
      </div>;
  }
  return <div className="mt-2 space-y-2">
      {description && <div>
          <h4 className="font-semibold text-sm text-gray-700">Description:</h4>
          <p className="text-gray-600 text-sm mt-1">{description}</p>
        </div>}
      
      {/* Display confirmation status */}
      {confirmationStatus === 'confirmed' && appointmentTime && <div className="mt-1 flex items-center gap-2">
          <Badge className="bg-green-500 hover:bg-green-600 text-white">Confirmed</Badge>
          <span className="text-sm text-gray-600">
            {appointmentTime}
            {isAppointmentExpired && <Badge variant="outline" className="ml-1 text-red-500 border-red-300 bg-red-50 text-xs">Expired</Badge>}
          </span>
        </div>}
      
      {confirmationStatus === 'unconfirmed' && <div className="mt-1">
          <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">Unconfirmed</Badge>
          {purchasedAt && status === 'sold' && <ConfirmationTimer purchasedAt={purchasedAt} />}
        </div>}
      
      {/* Contact information */}
      {contactName && <p className="text-gray-600 text-sm">
          <span className="font-semibold">Contact:</span> {contactName}
        </p>}
      
      {/* Show buyer information only if viewer is not a seller */}
      {shouldShowBuyerName && <p className="text-gray-600 text-sm">
          <span className="font-semibold">Buyer:</span> {buyerName}
        </p>}
      
      {/* Only show these fields in full details mode */}
      {contactPhone && <p className="text-gray-600 text-sm">
          <span className="font-semibold">Phone:</span> {contactPhone}
        </p>}
      
      {contactEmail && <p className="text-gray-600 text-sm">
          <span className="font-semibold">Email:</span> {contactEmail}
        </p>}
      
      {address && <p className="text-gray-600 text-sm">
          <span className="font-semibold">Address:</span> {address}
        </p>}
    </div>;
};
export default LeadCardDetails;
