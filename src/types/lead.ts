
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
