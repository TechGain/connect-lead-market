
export interface Lead {
  id: string;
  type: string;
  location: string;
  description?: string;
  price: number;
  qualityRating: number | null;
  status: 'new' | 'pending' | 'sold' | 'erased';  // Added 'erased' status
  sellerId: string;
  sellerName?: string;
  buyerId?: string | null;
  buyerName?: string | null;
  createdAt: string;
  purchasedAt?: string | null;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  zipCode?: string;
  appointmentTime?: string;
  firstName?: string;
  confirmationStatus?: 'confirmed' | 'unconfirmed';
}

// Helper function to convert from database format to our app format
export const mapDbLeadToAppLead = (dbLead: any): Lead => {
  // Extract the first name from the contact_name field
  const firstName = dbLead.contact_name ? dbLead.contact_name.split(' ')[0] : undefined;
  
  // Get the zip code directly from the database field if available
  // Otherwise try to extract it from the location field as a fallback
  let zipCode = dbLead.zip_code || '';
  if (!zipCode && dbLead.location) {
    const zipMatch = dbLead.location.match(/\b\d{5}\b/g);
    zipCode = zipMatch ? zipMatch[0] : '';
  }
  
  return {
    id: dbLead.id,
    type: dbLead.type,
    location: dbLead.location,
    description: dbLead.description || '',
    price: parseFloat(dbLead.price) || 0,
    qualityRating: dbLead.quality_rating,
    status: dbLead.status,
    sellerId: dbLead.seller_id,
    sellerName: dbLead.seller_name,
    buyerId: dbLead.buyer_id,
    buyerName: dbLead.buyer_name,
    createdAt: dbLead.created_at,
    purchasedAt: dbLead.purchased_at,
    contactName: dbLead.contact_name || '',
    contactEmail: dbLead.contact_email || '',
    contactPhone: dbLead.contact_phone || '',
    address: dbLead.address || '', 
    zipCode: zipCode,
    firstName: firstName,
    confirmationStatus: dbLead.confirmation_status || 'confirmed',
    appointmentTime: dbLead.appointment_time || undefined
  };
};

// Helper function to convert from app format to database format
export const mapAppLeadToDbLead = (appLead: Omit<Lead, 'id'>): any => {
  return {
    type: appLead.type,
    location: appLead.location,
    description: appLead.description,
    price: appLead.price,
    quality_rating: appLead.qualityRating,
    status: appLead.status,
    seller_id: appLead.sellerId,
    seller_name: appLead.sellerName, // Map the new field
    contact_name: appLead.contactName,
    contact_email: appLead.contactEmail,
    contact_phone: appLead.contactPhone,
    address: appLead.address,
    zip_code: appLead.zipCode,
    confirmation_status: appLead.confirmationStatus,
    appointment_time: appLead.appointmentTime
  };
};
