
/**
 * Formats a number as currency with 2 decimal places
 * @param value The number to format
 * @returns Formatted currency string without the dollar sign
 */
export const formatCurrency = (value: number): string => {
  return Number(value).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
};
