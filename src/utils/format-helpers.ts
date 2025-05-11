
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

/**
 * Formats a phone number to E.164 format for use with Twilio and other services
 * Assumes US numbers if no country code is provided
 * @param phoneNumber The phone number to format
 * @returns Phone number in E.164 format (e.g., +12125551234)
 */
export const formatPhoneToE164 = (phoneNumber: string): string => {
  if (!phoneNumber) return '';
  
  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, '');
  
  // Check if it already has a country code (assuming +1 for US starts with 1 and has 11 digits)
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }
  
  // If it's a 10-digit number, assume it's a US number and add +1
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  
  // If it already has a plus sign, return as is
  if (phoneNumber.startsWith('+')) {
    return phoneNumber;
  }
  
  // Default: add US country code if it appears to be a valid US number
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  
  // Return the original if we can't determine the format
  // This might not be valid for SMS, but preserves the original input
  return phoneNumber;
};

/**
 * Validates if a string appears to be a valid phone number
 * Basic validation - checks for minimum digits
 * @param phoneNumber The phone number to validate
 * @returns boolean indicating if the phone number appears valid
 */
export const isValidPhoneNumber = (phoneNumber: string): boolean => {
  if (!phoneNumber) return false;
  
  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, '');
  
  // Basic validation: Check if it has at least 10 digits
  return digits.length >= 10;
};
