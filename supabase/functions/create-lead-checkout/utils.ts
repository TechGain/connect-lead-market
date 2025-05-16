
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Types
export interface CheckoutRequestData {
  leadId: string;
  preferredPaymentMethod?: string;
}

export interface Lead {
  id: string;
  price: number;
  type: string;
  location: string;
  status: string;
  [key: string]: any;
}

export interface StripeSessionOptions {
  customerId?: string;
  customerEmail?: string;
  preferredPaymentMethod: string;
}

// CORS headers configuration
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-application-name",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
};

// Enhanced logging function
export const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-LEAD-CHECKOUT] ${step}${detailsStr}`);
};

// Initialize Supabase clients
export const initializeSupabaseClients = () => {
  // Admin client with service role key for bypassing RLS
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  // Client with anon key for user authentication
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  return { supabaseAdmin, supabaseClient };
};

// Apply 10% markup for buyers
export const applyBuyerPriceMarkup = (price: number): number => {
  return price * 1.1; // 10% markup
};

// Handle CORS preflight requests
export const handleCorsPreflightRequest = (): Response => {
  logStep("Handling OPTIONS request");
  return new Response(null, { headers: corsHeaders });
};

// Create a response with CORS headers
export const createResponse = (data: any, status = 200): Response => {
  return new Response(
    JSON.stringify(data),
    { 
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status 
    }
  );
};
