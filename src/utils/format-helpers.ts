
/**
 * Formats a number as currency with 2 decimal places
 * @param value The number to format
 * @returns Formatted currency string without the dollar sign
 */
export const formatCurrency = (value: number): string => {
  return Number(value).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
};

/**
 * Ensures a value is converted to a number type for calculations
 * @param value The value to convert to number
 * @returns A number, or 0 if conversion fails
 */
export const ensureNumber = (value: any): number => {
  const num = Number(value);
  return !isNaN(num) ? num : 0;
};
