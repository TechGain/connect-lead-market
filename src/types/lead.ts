
export interface Lead {
  id: string;
  type: string;
  location: string;
  description: string;
  price: number;
  qualityRating: number;
  status: 'new' | 'pending' | 'sold';
  sellerId: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  createdAt: string;
  buyerId?: string;
  purchasedAt?: string;
}

// Mapping between database columns and frontend properties
export const mapDbLeadToLead = (dbLead: any): Lead => {
  return {
    id: dbLead.id,
    type: dbLead.type,
    location: dbLead.location,
    description: dbLead.description,
    price: dbLead.price,
    qualityRating: dbLead.quality_rating,
    status: dbLead.status,
    sellerId: dbLead.seller_id,
    contactName: dbLead.contact_name,
    contactEmail: dbLead.contact_email,
    contactPhone: dbLead.contact_phone,
    createdAt: dbLead.created_at,
    buyerId: dbLead.buyer_id || undefined,
    purchasedAt: dbLead.purchased_at || undefined,
  };
};

// Mapping between frontend properties and database columns
export const mapLeadToDbLead = (lead: Omit<Lead, 'id'>): any => {
  return {
    type: lead.type,
    location: lead.location,
    description: lead.description,
    price: lead.price,
    quality_rating: lead.qualityRating,
    status: lead.status,
    seller_id: lead.sellerId,
    contact_name: lead.contactName,
    contact_email: lead.contactEmail,
    contact_phone: lead.contactPhone,
    created_at: lead.createdAt,
    buyer_id: lead.buyerId || null,
    purchased_at: lead.purchasedAt || null,
  };
};
