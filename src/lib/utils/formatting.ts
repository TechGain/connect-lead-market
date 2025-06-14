
/**
 * Utility functions for formatting values
 */

/**
 * Format a number as currency (USD)
 * @param amount The amount to format
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number): string {
  // For whole dollar amounts, display without decimal places
  if (Math.round(amount) === amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }
  
  // Otherwise use standard 2 decimal places
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
}

/**
 * Rounds a number to the nearest dollar
 * @param amount The amount to round
 * @returns Rounded dollar amount
 */
export function roundToNearestDollar(amount: number): number {
  return Math.round(amount);
}

/**
 * Formats a lead type from kebab-case to Title Case
 * Example: "full-home-renovation" -> "Full Home Renovation"
 * Special case for "hvac" -> "HVAC" (all caps)
 * Special case for "adu" -> "ADU" (all caps)
 */
export function formatLeadType(type: string): string {
  if (!type) return '';
  
  // Special case for "hvac" - return it in all caps
  if (type.toLowerCase() === 'hvac') {
    return 'HVAC';
  }
  
  // Special case for "adu" - return it in all caps
  if (type.toLowerCase() === 'adu') {
    return 'ADU';
  }
  
  return type
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Truncates text to a specified length and adds ellipsis if needed
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}
