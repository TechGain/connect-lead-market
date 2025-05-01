import { Lead } from '@/types/lead';

// Mock data for leads
let mockLeads: Lead[] = [
  {
    id: 'lead_1',
    type: 'roofing',
    location: 'Austin, TX',
    description: 'Need roof repair after storm',
    contactName: 'John Smith',
    contactEmail: 'john.smith@example.com',
    contactPhone: '512-555-1212',
    price: 50.00,
    qualityRating: 4,
    status: 'new',
    sellerId: 'seller_1',
    createdAt: new Date().toISOString(),
    appointmentTime: '06/15/2024 at 10:00 AM - 12:00 PM',
  },
  {
    id: 'lead_2',
    type: 'plumbing',
    location: 'Dallas, TX',
    description: 'Leaky faucet in bathroom',
    contactName: 'Jane Doe',
    contactEmail: 'jane.doe@example.com',
    contactPhone: '214-555-2323',
    price: 40.00,
    qualityRating: 3,
    status: 'pending',
    sellerId: 'seller_1',
    buyerId: 'buyer_1',
    createdAt: new Date().toISOString(),
    purchasedAt: new Date().toISOString(),
    appointmentTime: '06/22/2024 at 2:00 PM - 4:00 PM',
  },
  {
    id: 'lead_3',
    type: 'electrical',
    location: 'Houston, TX',
    description: 'Need to install new light fixture',
    contactName: 'Bob Johnson',
    contactEmail: 'bob.johnson@example.com',
    contactPhone: '713-555-3434',
    price: 60.00,
    qualityRating: 5,
    status: 'sold',
    sellerId: 'seller_2',
    buyerId: 'buyer_2',
    createdAt: new Date().toISOString(),
    purchasedAt: new Date().toISOString(),
    appointmentTime: '07/01/2024 at 8:00 AM - 10:00 AM',
  },
  {
    id: 'lead_4',
    type: 'hvac',
    location: 'San Antonio, TX',
    description: 'AC not working',
    contactName: 'Alice Williams',
    contactEmail: 'alice.williams@example.com',
    contactPhone: '210-555-4545',
    price: 55.00,
    qualityRating: 4,
    status: 'new',
    sellerId: 'seller_2',
    createdAt: new Date().toISOString(),
    appointmentTime: '07/15/2024 at 12:00 PM - 2:00 PM',
  },
  {
    id: 'lead_5',
    type: 'landscaping',
    location: 'Fort Worth, TX',
    description: 'Need lawn mowing service',
    contactName: 'Charlie Brown',
    contactEmail: 'charlie.brown@example.com',
    contactPhone: '817-555-5656',
    price: 35.00,
    qualityRating: 3,
    status: 'pending',
    sellerId: 'seller_3',
    buyerId: 'buyer_3',
    createdAt: new Date().toISOString(),
    purchasedAt: new Date().toISOString(),
    appointmentTime: '08/01/2024 at 4:00 PM - 6:00 PM',
  },
];

// Function to fetch all leads
export const fetchLeads = async (): Promise<Lead[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
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
    status: 'pending',
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

// New function to rate a lead
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
