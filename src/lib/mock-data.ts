
import { Lead } from '@/types/lead';

// Mock data for leads with empty initial data
let mockLeads: Lead[] = [];

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
    status: 'sold',
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
