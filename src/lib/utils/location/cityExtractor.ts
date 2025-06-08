
/**
 * City extraction utilities for parsing location strings
 */

import { zipToCityMap } from './zipCodeMappings';

/**
 * Helper function to extract city from a ZIP code string
 * @param zipString String that might contain a ZIP code
 * @returns City name if found, undefined otherwise
 */
function extractCityFromZip(zipString: string): string | undefined {
  if (!zipString) return undefined;
  
  // Extract ZIP code if it's embedded in text
  const zipCodeRegex = /\b(\d{5}(-\d{4})?)\b/;
  const zipMatch = zipString.match(zipCodeRegex);
  
  if (zipMatch && zipMatch[1]) {
    // Get just the 5-digit ZIP
    const zipCode = zipMatch[1].substring(0, 5);
    return zipToCityMap[zipCode];
  }
  
  return undefined;
}

/**
 * Greatly enhanced function to extract city names from various location string formats
 * Now prioritizes ZIP code lookup and Google Maps format parsing
 * 
 * @param location The location string from which to extract the city
 * @param fallback Fallback value (usually ZIP code) to use if extraction fails
 * @param debug Optional flag to enable debug logging
 * @returns The extracted city name
 */
export function extractCityFromLocation(location: string, fallback: string = 'Unknown', debug: boolean = false): string {
  if (!location || typeof location !== 'string') {
    if (debug) console.log(`[CityExtractor] Invalid location: "${location}", using fallback`);
    return extractCityFromZip(fallback) || 'N/A';
  }
  
  try {
    // Trim and normalize the location (remove extra spaces)
    const trimmedLocation = location.trim().replace(/\s+/g, ' ');
    
    if (debug) {
      console.log(`[CityExtractor] Processing: "${trimmedLocation}"`);
    }
    
    // First priority: Extract ZIP code from the location and look it up directly
    const zipCodeRegex = /\b(\d{5}(-\d{4})?)\b/;
    const zipMatch = trimmedLocation.match(zipCodeRegex);
    
    if (zipMatch) {
      const zipCode = zipMatch[1].substring(0, 5);
      const cityFromZip = zipToCityMap[zipCode];
      
      if (cityFromZip) {
        if (debug) console.log(`[CityExtractor] Found via ZIP lookup: "${cityFromZip}" from ZIP: ${zipCode}`);
        return cityFromZip;
      }
    }
    
    // NEW: Google Maps format - "Street, City, State, Country"
    // Example: "2341 Gloaming Way, Beverly Hills, CA, USA"
    const googleMapsRegex = /^[^,]+,\s*([^,]+),\s*[A-Z]{2},\s*USA$/i;
    const googleMapsMatch = trimmedLocation.match(googleMapsRegex);
    
    if (googleMapsMatch) {
      const city = googleMapsMatch[1].trim();
      if (debug) console.log(`[CityExtractor] Google Maps format matched: "${city}"`);
      return city;
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
    
    // Format 3: "State ZIP" (with no city) - use ZIP code lookup
    // Example: "CA 90001"
    const stateZipRegex = /^([A-Z]{2})\s+(\d{5}(-\d{4})?)$/;
    const stateZipMatch = trimmedLocation.match(stateZipRegex);
    
    if (stateZipMatch) {
      const zip = stateZipMatch[2];
      
      // First check if we can get city from ZIP
      if (zipToCityMap[zip.substring(0, 5)]) {
        const mappedCity = zipToCityMap[zip.substring(0, 5)];
        if (debug) console.log(`[CityExtractor] Format 3 ZIP lookup: "${mappedCity}"`);
        return mappedCity;
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
    
    // Format 6: Pipe-separated address with city
    // Example: "1493 Enderby WAY | Sunnyvale | 94087"
    const pipeSeparatedRegex = /\|\s*([^|]+?)\s*\|/;
    const pipeSeparatedMatch = trimmedLocation.match(pipeSeparatedRegex);
    
    if (pipeSeparatedMatch) {
      const potentialCity = pipeSeparatedMatch[1].trim();
      if (!/^\d+$/.test(potentialCity) && potentialCity.length > 1) {
        if (debug) console.log(`[CityExtractor] Format 6 (pipe-separated) matched: "${potentialCity}"`);
        return potentialCity;
      }
    }
    
    // Format 7: Multi-part address with city in middle
    // Split by commas and examine each part
    const parts = trimmedLocation.split(',').map(part => part.trim());
    
    // If we have 3 or more parts, check the second to last part for a city
    if (parts.length >= 3) {
      // Second to last part is often the city
      const potentialCity = parts[parts.length - 2];
      
      // If it doesn't contain digits (to avoid ZIP codes), use it
      if (!/\d/.test(potentialCity)) {
        if (debug) console.log(`[CityExtractor] Format 7 matched: "${potentialCity}"`);
        return potentialCity;
      }
    }
    
    // Format 8: If we just have two parts, assume first is city (when no street address)
    // Example: "San Francisco, CA"
    if (parts.length === 2) {
      const potentialCity = parts[0];
      if (!/\d/.test(potentialCity)) {
        if (debug) console.log(`[CityExtractor] Format 8 matched: "${potentialCity}"`);
        return potentialCity;
      }
    }
    
    // Format 9: Simple city name (no state/ZIP)
    // Example: "Chicago"
    if (parts.length === 1 && !/\d/.test(parts[0]) && parts[0].length > 2) {
      if (debug) console.log(`[CityExtractor] Format 9 matched: "${parts[0]}"`);
      return parts[0];
    }
    
    // If we get here, handle fallback to ZIP code lookup
    const cityFromZip = extractCityFromZip(fallback);
    if (cityFromZip) {
      return cityFromZip;
    }
    
    // If all methods fail, return N/A instead of state/country
    return 'N/A';
    
  } catch (error) {
    console.error("[CityExtractor] Error extracting city:", error);
    return 'N/A';
  }
}
