
import { Lead, mapDbLeadToLead, mapLeadToDbLead } from '@/types/lead';
import { generateId, getRandomInt } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// Generate mock data for initial seeding
const leadTypes = ['roofing', 'plumbing', 'electrical', 'hvac', 'landscaping'];
const locations = ['New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ'];
const statuses = ['new', 'pending', 'sold'];

export const generateMockLeads = (count = 20): Lead[] => {
  return Array.from({ length: count }, (_, i) => {
    const type = leadTypes[getRandomInt(0, leadTypes.length - 1)];
    const location = locations[getRandomInt(0, locations.length - 1)];
    const status = statuses[getRandomInt(0, 2)] as 'new' | 'pending' | 'sold';
    const qualityRating = getRandomInt(1, 5);
    const price = getRandomInt(20, 250);
    
    return {
      id: generateId(),
      type,
      location,
      description: `${type.charAt(0).toUpperCase() + type.slice(1)} project requiring professional service. Customer is looking for immediate assistance with their ${type} needs.`,
      price,
      qualityRating,
      status,
      sellerId: `seller-${getRandomInt(1, 5)}`,
      contactName: `Customer ${i + 1}`,
      contactEmail: `customer${i + 1}@example.com`,
      contactPhone: `(${getRandomInt(100, 999)}) ${getRandomInt(100, 999)}-${getRandomInt(1000, 9999)}`,
      createdAt: new Date(Date.now() - getRandomInt(1, 30) * 24 * 60 * 60 * 1000).toISOString(),
      buyerId: status === 'sold' ? `buyer-${getRandomInt(1, 3)}` : undefined,
      purchasedAt: status === 'sold' ? new Date(Date.now() - getRandomInt(1, 10) * 24 * 60 * 60 * 1000).toISOString() : undefined,
    };
  });
};

// Database operations
export const fetchLeads = async (): Promise<Lead[]> => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return data.map(mapDbLeadToLead);
  } catch (error) {
    console.error('Error fetching leads:', error);
    toast.error('Failed to load leads');
    return [];
  }
};

export const fetchLeadsBySeller = async (sellerId: string): Promise<Lead[]> => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return data.map(mapDbLeadToLead);
  } catch (error) {
    console.error('Error fetching seller leads:', error);
    toast.error('Failed to load your leads');
    return [];
  }
};

export const fetchLeadsByBuyer = async (buyerId: string): Promise<Lead[]> => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('buyer_id', buyerId)
      .order('purchased_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return data.map(mapDbLeadToLead);
  } catch (error) {
    console.error('Error fetching purchased leads:', error);
    toast.error('Failed to load your purchased leads');
    return [];
  }
};

export const createLead = async (lead: Omit<Lead, 'id'>): Promise<Lead | null> => {
  try {
    const dbLead = mapLeadToDbLead(lead);
    
    const { data, error } = await supabase
      .from('leads')
      .insert(dbLead)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return mapDbLeadToLead(data);
  } catch (error) {
    console.error('Error creating lead:', error);
    toast.error('Failed to create lead');
    return null;
  }
};

export const updateLead = async (id: string, updates: Partial<Lead>): Promise<Lead | null> => {
  try {
    const dbUpdates = Object.entries(updates).reduce((acc, [key, value]) => {
      // Convert camelCase to snake_case for database columns
      const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      return { ...acc, [dbKey]: value };
    }, {});
    
    const { data, error } = await supabase
      .from('leads')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return mapDbLeadToLead(data);
  } catch (error) {
    console.error('Error updating lead:', error);
    toast.error('Failed to update lead');
    return null;
  }
};

export const purchaseLead = async (leadId: string, buyerId: string): Promise<Lead | null> => {
  try {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('leads')
      .update({
        status: 'sold',
        buyer_id: buyerId,
        purchased_at: now
      })
      .eq('id', leadId)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return mapDbLeadToLead(data);
  } catch (error) {
    console.error('Error purchasing lead:', error);
    toast.error('Failed to purchase lead');
    return null;
  }
};

export const rateLead = async (
  leadId: string, 
  buyerId: string, 
  rating: number, 
  review: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('lead_ratings')
      .insert({
        lead_id: leadId,
        buyer_id: buyerId,
        rating,
        review: review || null,
        created_at: new Date().toISOString()
      });
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error rating lead:', error);
    toast.error('Failed to submit rating');
    return false;
  }
};

// For backwards compatibility - generate mock data if needed
export const mockLeads = generateMockLeads();
