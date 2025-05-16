
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { 
  logStep, 
  corsHeaders, 
  handleCorsPreflightRequest, 
  initializeSupabaseClients,
  createResponse,
  CheckoutRequestData
} from "./utils.ts";
import { authenticateUser, fetchLead } from "./auth.ts";
import { createStripeCheckoutSession } from "./stripe.ts";

// Main handler function
serve(async (req) => {
  logStep("Function called", { method: req.method, url: req.url });
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return handleCorsPreflightRequest();
  }

  try {
    logStep("Function started");
    
    // Parse request data
    let requestData: CheckoutRequestData;
    try {
      requestData = await req.json();
      logStep("Request data parsed", requestData);
    } catch (e) {
      const error = "Failed to parse request body: " + e.message;
      logStep("ERROR: " + error);
      throw new Error(error);
    }
    
    const { leadId, preferredPaymentMethod = 'card' } = requestData;
    if (!leadId) {
      const error = "Lead ID is required";
      logStep("ERROR: " + error);
      throw new Error(error);
    }

    logStep("Processing lead checkout", { leadId, preferredPaymentMethod });

    // Get auth header for user authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      const error = "No authorization header provided";
      logStep("ERROR: " + error);
      throw new Error(error);
    }
    
    // Initialize Supabase clients
    const { supabaseAdmin, supabaseClient } = initializeSupabaseClients();

    // Authenticate the user
    const token = authHeader.replace("Bearer ", "");
    const user = await authenticateUser(token, supabaseClient);
    
    // Fetch lead data
    const lead = await fetchLead(leadId, supabaseAdmin);
    
    // Create Stripe checkout session with preferred payment method
    const session = await createStripeCheckoutSession(lead, user, preferredPaymentMethod, req);
    
    // Return the checkout URL to the client
    return createResponse({ 
      success: true, 
      url: session.url,
      message: "Checkout session created successfully" 
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-lead-checkout", { message: errorMessage });
    
    return createResponse({ 
      success: false, 
      error: errorMessage,
      debug: {
        timestamp: new Date().toISOString(),
        headers: Object.fromEntries(req.headers),
      }
    }, 400);
  }
});
