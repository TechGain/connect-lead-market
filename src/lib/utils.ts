
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Formats a lead type from kebab-case to Title Case
 * Example: "full-home-renovation" -> "Full Home Renovation"
 * Special case for "hvac" -> "HVAC" (all caps)
 */
export function formatLeadType(type: string): string {
  if (!type) return '';
  
  // Special case for "hvac" - return it in all caps
  if (type.toLowerCase() === 'hvac') {
    return 'HVAC';
  }
  
  return type
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Applies a 20% markup to the lead price for buyers in the marketplace
 * @param price The base price set by the seller
 * @returns The price with 20% markup applied
 */
export function applyBuyerPriceMarkup(price: number): number {
  return price * 1.2;  // Apply 20% markup
}

/**
 * Extracts the city name from a location string
 * @param location The location string, typically in format "City, State ZIP" or "Address, City, State ZIP"
 * @returns The extracted city name, or fallback if city can't be determined
 */
export function extractCityFromLocation(location: string, fallback: string = 'Unknown'): string {
  if (!location) return fallback;
  
  // Common formats:
  // "Los Angeles, CA 90001"
  // "123 Main St, Los Angeles, CA 90001"
  
  try {
    // Split by commas
    const parts = location.split(',').map(part => part.trim());
    
    if (parts.length === 1) {
      // If there's just one part, it's likely just the city or cannot be parsed
      return parts[0] || fallback;
    }
    
    if (parts.length === 2) {
      // Format is likely "City, State ZIP"
      return parts[0];
    }
    
    if (parts.length >= 3) {
      // Format is likely "Address, City, State ZIP" - the city is the second-to-last part
      return parts[parts.length - 2];
    }
    
    return fallback;
  } catch (error) {
    console.error("Error extracting city from location:", error);
    return fallback;
  }
}
