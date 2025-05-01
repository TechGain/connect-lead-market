
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
  buyerId?: string;
  createdAt: string;
  purchasedAt?: string;
  appointmentTime?: string; // Add this field for appointment times
}
