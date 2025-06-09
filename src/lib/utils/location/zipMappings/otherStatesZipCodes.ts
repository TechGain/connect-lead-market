
/**
 * ZIP code to city mappings for states other than California
 */

// Texas ZIP codes
export const texasZipCodes: Record<string, string> = {
  '78626': 'Georgetown',
  '77016': 'Houston',
  '77573': 'League City',
};

// Nevada ZIP codes
export const nevadaZipCodes: Record<string, string> = {
  '89052': 'Henderson',
};

// Add more states as needed
export const otherStatesZipCodes: Record<string, string> = {
  ...texasZipCodes,
  ...nevadaZipCodes,
};
