
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the request body
    const requestData = await req.json();
    const { chatId, userName, userEmail, message } = requestData;
    
    if (!chatId || !message) {
      throw new Error("Chat ID and message are required");
    }

    // Initialize Supabase client with service role key for bypassing RLS
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    // Add a response message from representative
    const { data, error } = await supabaseAdmin
      .from("messages")
      .insert({
        chat_id: chatId,
        sender_type: "rep",
        content: "Thank you for your message. Our team will get back to you shortly.",
        sender_name: "Support Team" // Add the sender_name field
      });

    if (error) throw error;

    // Return success response
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
