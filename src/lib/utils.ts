
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

// Common ZIP codes to city mappings for fallback
const zipToCityMap: Record<string, string> = {
  // California
  '90001': 'Los Angeles',
  '90210': 'Beverly Hills',
  '91344': 'Granada Hills',
  '92614': 'Irvine',
  '94016': 'San Francisco',
  '95814': 'Sacramento',
  // New York
  '10001': 'New York',
  '10012': 'New York',
  '11201': 'Brooklyn',
  // Texas
  '75001': 'Dallas',
  '77001': 'Houston',
  '78701': 'Austin',
  // Florida
  '33101': 'Miami',
  '32801': 'Orlando',
  // Illinois
  '60601': 'Chicago',
};

// Map of state codes to common cities
const stateCityMap: Record<string, string> = {
  'AL': 'Birmingham',
  'AK': 'Anchorage',
  'AZ': 'Phoenix',
  'AR': 'Little Rock',
  'CA': 'Los Angeles',
  'CO': 'Denver',
  'CT': 'Hartford',
  'DE': 'Dover',
  'FL': 'Miami',
  'GA': 'Atlanta',
  'HI': 'Honolulu',
  'ID': 'Boise',
  'IL': 'Chicago',
  'IN': 'Indianapolis',
  'IA': 'Des Moines',
  'KS': 'Topeka',
  'KY': 'Louisville',
  'LA': 'New Orleans',
  'ME': 'Portland',
  'MD': 'Baltimore',
  'MA': 'Boston',
  'MI': 'Detroit',
  'MN': 'Minneapolis',
  'MS': 'Jackson',
  'MO': 'Kansas City',
  'MT': 'Billings',
  'NE': 'Omaha',
  'NV': 'Las Vegas',
  'NH': 'Manchester',
  'NJ': 'Newark',
  'NM': 'Albuquerque',
  'NY': 'New York',
  'NC': 'Charlotte',
  'ND': 'Fargo',
  'OH': 'Columbus',
  'OK': 'Oklahoma City',
  'OR': 'Portland',
  'PA': 'Philadelphia',
  'RI': 'Providence',
  'SC': 'Charleston',
  'SD': 'Sioux Falls',
  'TN': 'Nashville',
  'TX': 'Houston',
  'UT': 'Salt Lake City',
  'VT': 'Burlington',
  'VA': 'Richmond',
  'WA': 'Seattle',
  'WV': 'Charleston',
  'WI': 'Milwaukee',
  'WY': 'Cheyenne'
};

/**
 * Greatly enhanced function to accurately extract city names from various location string formats
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
    // Trim and normalize the location (remove extra spaces)
    const trimmedLocation = location.trim().replace(/\s+/g, ' ');
    
    if (debug) {
      console.log(`[CityExtractor] Processing: "${trimmedLocation}"`);
    }
    
    // First attempt: Try to find ZIP code and extract city from our map
    const zipCodeRegex = /\b(\d{5}(-\d{4})?)\b/;
    const zipMatch = trimmedLocation.match(zipCodeRegex);
    
    if (zipMatch && zipToCityMap[zipMatch[1]]) {
      const mappedCity = zipToCityMap[zipMatch[1]];
      if (debug) console.log(`[CityExtractor] Found via ZIP map: "${mappedCity}"`);
      return mappedCity;
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
    
    // Format 3: "State ZIP" (with no city) - use state to city mapping
    // Example: "CA 90001"
    const stateZipRegex = /^([A-Z]{2})\s+(\d{5}(-\d{4})?)$/;
    const stateZipMatch = trimmedLocation.match(stateZipRegex);
    
    if (stateZipMatch) {
      const state = stateZipMatch[1];
      const zip = stateZipMatch[2];
      
      // First check if we can get city from ZIP
      if (zipToCityMap[zip.substring(0, 5)]) {
        const mappedCity = zipToCityMap[zip.substring(0, 5)];
        if (debug) console.log(`[CityExtractor] Format 3 ZIP lookup: "${mappedCity}"`);
        return mappedCity;
      }
      
      // Fall back to state lookup
      if (stateCityMap[state]) {
        const stateCity = stateCityMap[state];
        if (debug) console.log(`[CityExtractor] Format 3 state lookup: "${stateCity}"`);
        return stateCity;
      }
    }
    
    // Format 4: "City, State" with no ZIP
    // Example: "Seattle, WA"
    const cityStateRegex = /^([^,]+),\s*([A-Z]{2})$/;
    const cityStateMatch = trimmedLocation.match(cityStateRegex);
    
    if (cityStateMatch) {
      const city = cityStateMatch[1].trim();
      if (debug) console.log(`[CityExtractor] Format 4 matched: "${city}"`);
      return city;
    }
    
    // Format 5: Check for "City State ZIP" without commas
    // Example: "Los Angeles CA 90001"
    const cityStateZipNoCommaRegex = /^([A-Za-z\s.]+)\s+([A-Z]{2})\s+(\d{5}(-\d{4})?)$/;
    const cityStateZipNoCommaMatch = trimmedLocation.match(cityStateZipNoCommaRegex);
    
    if (cityStateZipNoCommaMatch) {
      const city = cityStateZipNoCommaMatch[1].trim();
      if (debug) console.log(`[CityExtractor] Format 5 matched: "${city}"`);
      return city;
    }
    
    // Format 6: Multi-part address with city in middle
    // Split by commas and examine each part
    const parts = trimmedLocation.split(',').map(part => part.trim());
    
    // If we have 3 or more parts, check the second to last part for a city
    if (parts.length >= 3) {
      // Second to last part is often the city
      const potentialCity = parts[parts.length - 2];
      
      // If it doesn't contain digits (to avoid ZIP codes), use it
      if (!/\d/.test(potentialCity)) {
        if (debug) console.log(`[CityExtractor] Format 6 matched: "${potentialCity}"`);
        return potentialCity;
      }
    }
    
    // Format 7: If we just have two parts, assume first is city (when no street address)
    // Example: "San Francisco, CA"
    if (parts.length === 2) {
      const potentialCity = parts[0];
      if (!/\d/.test(potentialCity)) {
        if (debug) console.log(`[CityExtractor] Format 7 matched: "${potentialCity}"`);
        return potentialCity;
      }
    }
    
    // Format 8: Simple city name (no state/ZIP)
    // Example: "Chicago"
    if (parts.length === 1 && !/\d/.test(parts[0]) && parts[0].length > 2) {
      if (debug) console.log(`[CityExtractor] Format 8 matched: "${parts[0]}"`);
      return parts[0];
    }
    
    // Format 9: Check if any part looks like a city (no numbers, not a state code)
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      // If the part has no digits and is not a state code, it's likely a city
      if (part.length > 2 && !/\d/.test(part) && !/^[A-Z]{2}$/.test(part)) {
        if (debug) console.log(`[CityExtractor] Format 9 matched: "${part}"`);
        return part;
      }
    }
    
    // Format 10: Check for standalone ZIP code
    if (zipMatch && zipMatch[1]) {
      // Try to get city from ZIP map
      if (zipToCityMap[zipMatch[1]]) {
        const mappedCity = zipToCityMap[zipMatch[1]];
        if (debug) console.log(`[CityExtractor] Format 10 ZIP lookup: "${mappedCity}"`);
        return mappedCity;
      }
    }
    
    // Format 11: Check for standalone state code
    const stateMatch = trimmedLocation.match(/\b([A-Z]{2})\b/);
    if (stateMatch && stateCityMap[stateMatch[1]]) {
      const stateCity = stateCityMap[stateMatch[1]];
      if (debug) console.log(`[CityExtractor] Format 11 state lookup: "${stateCity}"`);
      return stateCity;
    }

    // If we get here, we couldn't extract a city - check if fallback is a ZIP code
    const fallbackZipMatch = fallback?.match(/^\d{5}(-\d{4})?$/);
    if (fallbackZipMatch && zipToCityMap[fallbackZipMatch[0]]) {
      const mappedCity = zipToCityMap[fallbackZipMatch[0]];
      if (debug) console.log(`[CityExtractor] Fallback ZIP lookup: "${mappedCity}"`);
      return mappedCity;
    }
    
    // Last attempt: Try to extract something meaningful from the location
    // If it's very short, it might be just a city name
    if (trimmedLocation.length < 20 && !trimmedLocation.includes(',') && !(/^\d+$/.test(trimmedLocation))) {
      if (debug) console.log(`[CityExtractor] Short location, assuming city: "${trimmedLocation}"`);
      return trimmedLocation;
    }
    
    if (debug) console.log(`[CityExtractor] No city found, using fallback: "${fallback}"`);
    return fallback;
    
  } catch (error) {
    console.error("[CityExtractor] Error extracting city:", error);
    return fallback;
  }
}

