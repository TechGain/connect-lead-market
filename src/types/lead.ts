
export interface Lead {
  id: string;
  type: string;
  location: string;
  description: string;
  price: number;
  qualityRating: number;
  status: 'new' | 'pending' | 'sold';
  sellerId?: string;
  buyerId?: string | null;
  createdAt: string;
  purchasedAt?: string | null;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  appointmentTime?: string;
  address?: string;
  zipCode?: string; 
  firstName?: string;
  confirmationStatus: string; // Add the new field
}

// Helper function to convert from database format to our app format
export const mapDbLeadToAppLead = (dbLead: any): Lead => {
  // Extract the first name from the contact_name field
  const firstName = dbLead.contact_name?.split(' ')[0] || '';
  
  // Get the zip code directly from the database field if available
  // Otherwise try to extract it from the location field as a fallback
  let zipCode = dbLead.zip_code || '';
  if (!zipCode && dbLead.location) {
    const zipMatch = dbLead.location.match(/\b\d{5}\b/g);
    zipCode = zipMatch ? zipMatch[0] : '';
  }
  
  // Ensure status is explicitly mapped to one of our valid statuses
  let status: 'new' | 'pending' | 'sold' = 'new';
  if (dbLead.status === 'sold') {
    status = 'sold';
  } else if (dbLead.status === 'pending') {
    status = 'pending';
  }
  
  // Debug lead mapping
  console.log(`Mapping lead ${dbLead.id}: DB status = "${dbLead.status}", mapped status = "${status}"`);
  
  return {
    id: dbLead.id,
    type: dbLead.type,
    location: dbLead.location,
    description: dbLead.description || '',
    price: dbLead.price,
    qualityRating: dbLead.quality_rating || 3,
    status: status,
    sellerId: dbLead.seller_id,
    buyerId: dbLead.buyer_id,
    createdAt: dbLead.created_at,
    purchasedAt: dbLead.purchased_at,
    contactName: dbLead.contact_name || '',
    contactEmail: dbLead.contact_email || '',
    contactPhone: dbLead.contact_phone || '',
    appointmentTime: dbLead.appointment_time || '',
    address: dbLead.address || '', 
    zipCode: zipCode,
    firstName: firstName,
    confirmationStatus: dbLead.confirmation_status || 'confirmed' // Map the new field with default
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
    contact_name: appLead.contactName,
    contact_email: appLead.contactEmail,
    contact_phone: appLead.contactPhone,
    address: appLead.address,
    zip_code: appLead.zipCode,
    confirmation_status: appLead.confirmationStatus,
    appointment_time: appLead.appointmentTime
  };
};
