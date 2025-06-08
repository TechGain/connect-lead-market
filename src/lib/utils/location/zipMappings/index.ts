
/**
 * Main ZIP code mappings export
 */

import { californiaZipCodes } from './californiaZipCodes';
import { otherStatesZipCodes } from './otherStatesZipCodes';

export { stateCityMap } from './stateCityMappings';

// Combine all ZIP code mappings
export const zipToCityMap: Record<string, string> = {
  ...californiaZipCodes,
  ...otherStatesZipCodes,
};

// Re-export individual state mappings for potential future use
export { californiaZipCodes, otherStatesZipCodes };
