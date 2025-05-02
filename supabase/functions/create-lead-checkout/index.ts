
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function for enhanced debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-LEAD-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logStep("STRIPE_SECRET_KEY not set");
      throw new Error("STRIPE_SECRET_KEY is not set. Please configure the environment variable.");
    }

    // Get the request body
    let requestData;
    try {
      requestData = await req.json();
      logStep("Request body parsed", requestData);
    } catch (e) {
      logStep("Error parsing request body", e);
      throw new Error("Invalid request body format");
    }
    
    const { leadId } = requestData;
    if (!leadId) {
      logStep("Lead ID missing");
      throw new Error("Lead ID is required");
    }

    logStep("Processing lead checkout", { leadId });

    // Get auth header for user authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("Authorization header missing");
      throw new Error("No authorization header provided. Please ensure you are logged in.");
    }
    
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
    logStep("Authenticating user with token", { tokenLength: token.length });
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) {
      logStep("Authentication error", userError);
      throw new Error(`Authentication error: ${userError.message}`);
    }
    
    const user = userData.user;
    if (!user?.id) {
      logStep("User not authenticated", { userData });
      throw new Error("User not authenticated");
    }
    
    logStep("User authenticated", { userId: user.id, email: user.email });

    // For now, we're using mock data for testing since we don't have a real database setup
    // In a production environment, this would fetch from a real leads table
    const mockLeadData = {
      id: leadId,
      type: "Home Renovation",
      location: "Los Angeles, CA",
      price: 49.99,
      status: "new",
      description: "Client looking for complete kitchen renovation",
      qualityRating: 4
    };

    const lead = mockLeadData;
    logStep("Lead fetched", lead);

    // Initialize Stripe with the secret key
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Create a Stripe Checkout session for one-time payment
    const session = await stripe.checkout.sessions.create({
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
      success_url: `${req.headers.get("origin")}/purchases?success=true&lead_id=${lead.id}`,
      cancel_url: `${req.headers.get("origin")}/marketplace?canceled=true`,
      client_reference_id: lead.id, // Store lead ID for reference
      metadata: {
        leadId: lead.id,
        buyerId: user.id,
      },
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

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
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
