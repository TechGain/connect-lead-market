
export interface Lead {
  id: string;
  type: string;
  location: string;
  description: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  price: number;
  qualityRating?: number;
  status: 'new' | 'pending' | 'sold';
  sellerId: string;
  buyerId?: string | null;
  createdAt: string;
  purchasedAt?: string | null;
  appointmentTime?: string; // Add this field for appointment times
  address: string; // Add the address property that was missing
}
