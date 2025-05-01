
import { Lead } from '@/types/lead';

// Mock data for leads with some initial sample data for testing
let mockLeads: Lead[] = [
  {
    id: 'lead_1',
    type: 'Residential Fence Installation',
    description: 'Looking for a contractor to install a 50ft wooden fence around my backyard.',
    location: 'Los Angeles, CA',
    price: 75,
    qualityRating: 4.5,
    status: 'new',
    sellerId: 'seller_1',
    buyerId: null,
    contactName: 'John Smith',
    contactPhone: '(213) 555-1234',
    contactEmail: 'john.smith@example.com',
    appointmentTime: '2025-05-15T14:00:00',
    address: '123 Main St, Los Angeles, CA 90001',
    createdAt: '2025-05-01T10:00:00',
    purchasedAt: null
  },
  {
    id: 'lead_2',
    type: 'Commercial Security Fencing',
    description: 'Need security fencing installed around commercial property, approximately 200ft perimeter.',
    location: 'San Diego, CA',
    price: 120,
    qualityRating: 5,
    status: 'new',
    sellerId: 'seller_2',
    buyerId: null,
    contactName: 'Business Property Management',
    contactPhone: '(619) 555-6789',
    contactEmail: 'property@example.com',
    appointmentTime: '2025-05-20T10:00:00',
    address: '456 Business Ave, San Diego, CA 92101',
    createdAt: '2025-05-01T11:00:00',
    purchasedAt: null
  },
  {
    id: 'lead_3',
    type: 'Pool Fencing Installation',
    description: 'Need code-compliant pool fencing installed for residential property.',
    location: 'Orange County, CA',
    price: 95,
    qualityRating: 4,
    status: 'new',
    sellerId: 'seller_1',
    buyerId: null,
    contactName: 'Sarah Johnson',
    contactPhone: '(714) 555-3456',
    contactEmail: 'sarah.j@example.com',
    appointmentTime: '2025-05-18T13:00:00',
    address: '789 Coastal Way, Newport Beach, CA 92660',
    createdAt: '2025-05-01T12:00:00',
    purchasedAt: null
  }
];

// Function to fetch all leads
export const fetchLeads = async (): Promise<Lead[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log("Fetching leads, count:", mockLeads.length);
  return mockLeads;
};

// Function to fetch leads by seller ID
export const fetchLeadsBySeller = async (sellerId: string): Promise<Lead[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockLeads.filter(lead => lead.sellerId === sellerId);
};

// Function to fetch leads by buyer ID
export const fetchLeadsByBuyer = async (buyerId: string): Promise<Lead[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockLeads.filter(lead => lead.buyerId === buyerId);
};

// Function to purchase a lead
export const purchaseLead = async (leadId: string, buyerId: string): Promise<Lead | undefined> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const leadIndex = mockLeads.findIndex(lead => lead.id === leadId && lead.status === 'new');
  if (leadIndex === -1) {
    return undefined; // Lead not found or not available
  }

  mockLeads[leadIndex] = {
    ...mockLeads[leadIndex],
    status: 'sold',  // Changed from 'pending' to 'sold'
    buyerId: buyerId,
    purchasedAt: new Date().toISOString(),
  };

  return mockLeads[leadIndex];
};

// Update createLead function to handle appointmentTime
export const createLead = async (lead: Omit<Lead, 'id'>): Promise<Lead> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const newLead: Lead = {
    id: `lead_${Date.now()}`,
    ...lead,
    createdAt: new Date().toISOString(),
  };
  
  mockLeads.push(newLead);
  return newLead;
};

// Function to rate a lead
export const rateLead = async (leadId: string, buyerId: string, rating: number, review: string): Promise<boolean> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const leadIndex = mockLeads.findIndex(lead => lead.id === leadId);
  
  if (leadIndex === -1) {
    return false; // Lead not found
  }
  
  // Update the lead's quality rating
  mockLeads[leadIndex] = {
    ...mockLeads[leadIndex],
    qualityRating: rating
  };
  
  // In a real app, we would store the review in a separate table
  console.log(`Review for lead ${leadId}: ${review}`);
  
  return true;
};
