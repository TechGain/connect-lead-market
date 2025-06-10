
/**
 * Utility functions for lead email notifications
 */

/**
 * Format price as USD currency
 */
export function formatCurrency(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

/**
 * Format date in a human-readable format
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * CORS headers for Edge Function responses - Updated to include x-lead-id
 */
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-lead-id",
};

/**
 * Create a standard JSON response with CORS headers
 */
export function createJsonResponse(data: any, status = 200): Response {
  return new Response(
    JSON.stringify(data),
    { 
      status, 
      headers: { 
        "Content-Type": "application/json",
        ...corsHeaders 
      }
    }
  );
}
