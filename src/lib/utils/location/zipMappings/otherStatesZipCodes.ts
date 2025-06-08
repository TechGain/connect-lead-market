
/**
 * ZIP code to city mappings for states other than California
 */

// Texas ZIP codes
export const texasZipCodes: Record<string, string> = {
  '78626': 'Georgetown',
};

// Add more states as needed
export const otherStatesZipCodes: Record<string, string> = {
  ...texasZipCodes,
};
