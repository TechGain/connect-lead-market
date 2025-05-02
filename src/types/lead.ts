
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
}

// Helper function to convert from database format to our app format
export const mapDbLeadToAppLead = (dbLead: any): Lead => {
  return {
    id: dbLead.id,
    type: dbLead.type,
    location: dbLead.location,
    description: dbLead.description || '',
    price: dbLead.price,
    qualityRating: dbLead.quality_rating || 3,
    status: dbLead.status,
    sellerId: dbLead.seller_id,
    buyerId: dbLead.buyer_id,
    createdAt: dbLead.created_at,
    purchasedAt: dbLead.purchased_at,
    contactName: dbLead.contact_name || '',
    contactEmail: dbLead.contact_email || '',
    contactPhone: dbLead.contact_phone || '',
    // These fields don't exist in DB schema but are used in the app
    appointmentTime: '',
    address: ''
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
    contact_phone: appLead.contactPhone
  };
};
