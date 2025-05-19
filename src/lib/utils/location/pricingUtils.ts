
/**
 * Pricing utilities for location-based services
 */

import { roundToNearestDollar } from '../formatting';

/**
 * Applies a 15% markup to the lead price for buyers in the marketplace
 * and rounds to the nearest dollar
 * @param price The original price
 * @returns Price with markup, rounded to nearest dollar
 */
export function applyBuyerPriceMarkup(price: number): number {
  return roundToNearestDollar(price * 1.15);  // Apply 15% markup and round
}
