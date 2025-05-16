
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// CORS headers configuration
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-application-name",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
};

// Enhanced logging function
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-LEAD-CHECKOUT] ${step}${detailsStr}`);
};

// Apply 10% markup for buyers
const applyBuyerPriceMarkup = (price: number): number => {
  return price * 1.1; // 10% markup
};

// Handle CORS preflight requests
const handleCorsPreflightRequest = (): Response => {
  logStep("Handling OPTIONS request");
  return new Response(null, { headers: corsHeaders });
};

// Initialize Supabase clients
const initializeSupabaseClients = () => {
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

// Authenticate user with token
const authenticateUser = async (token: string, supabaseClient: any) => {
  logStep("Authenticating with token", { tokenLength: token.length });
  
  try {
    const { data, error } = await supabaseClient.auth.getUser(token);
    if (error) {
      logStep("Authentication error", { error });
      throw new Error(`Authentication error: ${error.message}`);
    }
    
    const user = data.user;
    if (!user?.id) {
      throw new Error("User not authenticated");
    }
    
    logStep("User authenticated", { userId: user.id, email: user.email });
    return user;
  } catch (e) {
    const error = "Failed to authenticate user: " + e.message;
    logStep("ERROR: " + error);
    throw new Error(error);
  }
};

// Fetch lead data
const fetchLead = async (leadId: string, supabaseAdmin: any) => {
  logStep("Fetching lead data", { leadId });
  
  try {
    const { data, error } = await supabaseAdmin
      .from("leads")
      .select("*")
      .eq("id", leadId)
      .single();

    if (error) {
      logStep("Lead fetch error", { error });
      throw new Error(`Failed to fetch lead: ${error.message}`);
    }
    
    if (!data) {
      throw new Error("Lead not found");
    }
    
    // Ensure the lead is available for purchase
    if (data.status !== 'new') {
      throw new Error(`Lead is not available for purchase (status: ${data.status})`);
    }
    
    logStep("Lead fetched successfully", { leadId: data.id, price: data.price, type: data.type });
    return data;
  } catch (e) {
    const error = "Failed to fetch lead: " + e.message;
    logStep("ERROR: " + error);
    throw new Error(error);
  }
};

// Create Stripe checkout session
const createStripeCheckoutSession = async (lead: any, user: any, req: Request) => {
  logStep("Creating Stripe checkout session");
  
  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    
    // Apply 10% markup to the price for buyers
    const originalPrice = lead.price;
    const markedUpPrice = applyBuyerPriceMarkup(originalPrice);
    
    logStep("Applying price markup", { originalPrice, markedUpPrice });
    
    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    const origin = req.headers.get("origin") || "https://lead-marketplace-platform.com";
    
    // Configure the payment request with Google Pay and Apple Pay support
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "google_pay", "apple_pay"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${lead.type} Lead in ${lead.location}`,
              description: `Purchase access to contact information for this ${lead.type} lead`,
            },
            unit_amount: Math.round(Number(markedUpPrice) * 100), // Convert dollars to cents, with markup applied
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/purchases?success=true&lead_id=${lead.id}`,
      cancel_url: `${origin}/marketplace?canceled=true`,
      client_reference_id: lead.id, // Store lead ID for reference
      metadata: {
        leadId: lead.id,
        buyerId: user.id,
        originalPrice: originalPrice.toString(),
        markedUpPrice: markedUpPrice.toString(),
      },
      payment_method_options: {
        google_pay: { setup_future_usage: 'off_session' },
        apple_pay: { setup_future_usage: 'off_session' },
      },
    });
    
    logStep("Checkout session created", { sessionId: session.id, url: session.url });
    return session;
  } catch (e) {
    const error = "Failed to create Stripe checkout session: " + e.message;
    logStep("ERROR: " + error);
    throw new Error(error);
  }
};

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
    let requestData;
    try {
      requestData = await req.json();
      logStep("Request data parsed", requestData);
    } catch (e) {
      const error = "Failed to parse request body: " + e.message;
      logStep("ERROR: " + error);
      throw new Error(error);
    }
    
    const { leadId } = requestData;
    if (!leadId) {
      const error = "Lead ID is required";
      logStep("ERROR: " + error);
      throw new Error(error);
    }

    logStep("Processing lead checkout", { leadId });

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
    
    // Create Stripe checkout session
    const session = await createStripeCheckoutSession(lead, user, req);
    
    // Return the checkout URL to the client
    return new Response(
      JSON.stringify({ 
        success: true, 
        url: session.url,
        message: "Checkout session created successfully" 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-lead-checkout", { message: errorMessage });
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage,
        debug: {
          timestamp: new Date().toISOString(),
          headers: Object.fromEntries(req.headers),
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
