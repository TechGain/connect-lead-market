
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Updated CORS headers to include the x-application-name header
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-application-name",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
};

// Helper logging function for enhanced debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-LEAD-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  logStep("Function called", { method: req.method, url: req.url });
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    logStep("Handling OPTIONS request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      const error = "STRIPE_SECRET_KEY is not set";
      logStep("ERROR: " + error);
      throw new Error(error);
    }
    logStep("Stripe key verified");

    // Get the request body
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
    logStep("Authorization header found", { headerLength: authHeader.length });
    
    // Initialize Supabase client with service role key for bypassing RLS
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Initialize Supabase client with anon key for user authentication
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Authenticate the user
    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating with token", { tokenLength: token.length });
    
    let userData;
    try {
      const { data, error } = await supabaseClient.auth.getUser(token);
      if (error) {
        logStep("Authentication error", { error });
        throw new Error(`Authentication error: ${error.message}`);
      }
      userData = data;
      logStep("Authentication successful", { userId: userData?.user?.id });
    } catch (e) {
      const error = "Failed to authenticate user: " + e.message;
      logStep("ERROR: " + error);
      throw new Error(error);
    }
    
    const user = userData.user;
    if (!user?.id) {
      const error = "User not authenticated";
      logStep("ERROR: " + error);
      throw new Error(error);
    }
    
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Fetch lead data
    logStep("Fetching lead data", { leadId });
    let lead;
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
      lead = data;
      logStep("Lead fetch successful", { leadId: lead?.id });
    } catch (e) {
      const error = "Failed to fetch lead: " + e.message;
      logStep("ERROR: " + error);
      throw new Error(error);
    }

    if (!lead) {
      const error = "Lead not found";
      logStep("ERROR: " + error);
      throw new Error(error);
    }

    // Ensure the lead is available for purchase
    if (lead.status !== 'new') {
      const error = `Lead is not available for purchase (status: ${lead.status})`;
      logStep("ERROR: " + error);
      throw new Error(error);
    }

    logStep("Lead fetched successfully", { leadId: lead.id, price: lead.price, type: lead.type });

    // Initialize Stripe with the secret key
    logStep("Initializing Stripe");
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Create a Stripe Checkout session for one-time payment
    logStep("Creating Stripe checkout session");
    let session;
    try {
      const origin = req.headers.get("origin") || "https://lead-marketplace-platform.com";
      
      session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `${lead.type} Lead in ${lead.location}`,
                description: `Purchase access to contact information for this ${lead.type} lead`,
              },
              unit_amount: Math.round(Number(lead.price) * 100), // Convert dollars to cents
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
        },
      });
      logStep("Checkout session created", { sessionId: session.id, url: session.url });
    } catch (e) {
      const error = "Failed to create Stripe checkout session: " + e.message;
      logStep("ERROR: " + error);
      throw new Error(error);
    }

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
