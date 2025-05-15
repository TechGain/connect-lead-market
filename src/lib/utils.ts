
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
 */
export function formatLeadType(type: string): string {
  if (!type) return '';
  
  return type
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Applies a 10% markup to the lead price for buyers in the marketplace
 * @param price The base price set by the seller
 * @returns The price with 10% markup applied
 */
export function applyBuyerPriceMarkup(price: number): number {
  return price * 1.1;  // Apply 10% markup
}
