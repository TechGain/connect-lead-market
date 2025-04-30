
import { Lead } from '@/types/lead';
import { generateId, getRandomInt } from '@/lib/utils';

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

export const mockLeads = generateMockLeads();
