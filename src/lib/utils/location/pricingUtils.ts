
/**
 * Pricing utilities for location-based services
 */

import { roundToNearestDollar } from '../formatting';

/**
 * Applies a 20% markup to the lead price for buyers in the marketplace
 * and rounds to the nearest dollar
 * @param price The original price
 * @returns Price with markup, rounded to nearest dollar
 */
export function applyBuyerPriceMarkup(price: number): number {
  return roundToNearestDollar(price * 1.2);  // Apply 20% markup and round
}
