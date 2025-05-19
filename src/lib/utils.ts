
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
 * Enhanced function to accurately extract city names from various location string formats
 * 
 * @param location The location string from Google Maps or other source
 * @param fallback Fallback value to return if city extraction fails
 * @param debug Optional flag to enable debug logging
 * @returns The extracted city name
 */
export function extractCityFromLocation(location: string, fallback: string = 'Unknown', debug: boolean = false): string {
  if (!location || typeof location !== 'string') {
    return fallback;
  }
  
  try {
    // Trim the location and log it if debug is enabled
    const trimmedLocation = location.trim();
    
    if (debug) {
      console.log(`[CityExtractor] Processing: "${trimmedLocation}"`);
    }
    
    // Format 1: "City, State ZIP" or "City, ST ZIP"
    // Example: "Los Angeles, CA 90001"
    const cityStateZipRegex = /^([^,]+),\s*([A-Z]{2})\s+(\d{5}(-\d{4})?)$/;
    const cityStateZipMatch = trimmedLocation.match(cityStateZipRegex);
    
    if (cityStateZipMatch) {
      const city = cityStateZipMatch[1].trim();
      if (debug) console.log(`[CityExtractor] Format 1 matched: "${city}"`);
      return city;
    }
    
    // Format 2: "Street, City, State ZIP"
    // Example: "123 Main St, Los Angeles, CA 90001"
    const streetCityStateZipRegex = /^.+,\s*([^,]+),\s*([A-Z]{2})\s+(\d{5}(-\d{4})?)$/;
    const streetCityStateZipMatch = trimmedLocation.match(streetCityStateZipRegex);
    
    if (streetCityStateZipMatch) {
      const city = streetCityStateZipMatch[1].trim();
      if (debug) console.log(`[CityExtractor] Format 2 matched: "${city}"`);
      return city;
    }
    
    // Format 3: Multi-part address with city in middle
    // Split by commas and examine each part
    const parts = trimmedLocation.split(',').map(part => part.trim());
    
    // If we have 3 or more parts, check the second to last part for a city
    if (parts.length >= 3) {
      // Second to last part is often the city
      const potentialCity = parts[parts.length - 2];
      
      // If it doesn't contain digits (to avoid ZIP codes), use it
      if (!/\d/.test(potentialCity)) {
        if (debug) console.log(`[CityExtractor] Format 3 matched: "${potentialCity}"`);
        return potentialCity;
      }
    }
    
    // Format 4: Check for "City State ZIP" without commas
    // Example: "Los Angeles CA 90001"
    const cityStateZipNoCommaRegex = /^([A-Za-z\s.]+)\s+([A-Z]{2})\s+(\d{5}(-\d{4})?)$/;
    const cityStateZipNoCommaMatch = trimmedLocation.match(cityStateZipNoCommaRegex);
    
    if (cityStateZipNoCommaMatch) {
      const city = cityStateZipNoCommaMatch[1].trim();
      if (debug) console.log(`[CityExtractor] Format 4 matched: "${city}"`);
      return city;
    }
    
    // Format 5: If we just have two parts, assume first is city (when no street address)
    // Example: "San Francisco, CA"
    if (parts.length === 2) {
      const potentialCity = parts[0];
      if (!/\d/.test(potentialCity)) {
        if (debug) console.log(`[CityExtractor] Format 5 matched: "${potentialCity}"`);
        return potentialCity;
      }
    }
    
    // Format 6: Last resort, check if any part looks like a city (no numbers)
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      // If the part has no digits and is not a state code, it's likely a city
      if (part.length > 2 && !/\d/.test(part) && !/^[A-Z]{2}$/.test(part)) {
        if (debug) console.log(`[CityExtractor] Format 6 matched: "${part}"`);
        return part;
      }
    }
    
    // If we get here, we couldn't extract a city - log and return fallback
    if (debug) console.log(`[CityExtractor] No city found, using fallback: "${fallback}"`);
    return fallback;
    
  } catch (error) {
    console.error("[CityExtractor] Error extracting city:", error);
    return fallback;
  }
}

