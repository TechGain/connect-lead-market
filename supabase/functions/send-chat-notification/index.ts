
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
    const { chatId, userName, userEmail, message, isAdmin, senderName } = requestData;
    
    if (!chatId || !message) {
      throw new Error("Chat ID and message are required");
    }

    // Initialize Supabase client with service role key for bypassing RLS
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    // Skip adding a system response if message is coming from an admin
    if (isAdmin) {
      // For admin messages, we only log the successful reception
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Check if a representative has already sent a message in this chat
    const { data: existingRepMessages, error: queryError } = await supabaseAdmin
      .from("messages")
      .select("id")
      .eq("chat_id", chatId)
      .eq("sender_type", "rep")
      .limit(1);
      
    if (queryError) {
      console.error("Error checking for existing rep messages:", queryError);
      throw queryError;
    }
    
    // Only send an automatic response if there are no existing rep messages
    if (!existingRepMessages || existingRepMessages.length === 0) {
      const { data, error } = await supabaseAdmin
        .from("messages")
        .insert({
          chat_id: chatId,
          sender_type: "rep",
          content: "Thank you for your message. Our team will get back to you shortly.",
          sender_name: "Support Team" // Add the sender_name field
        });

      if (error) throw error;
    }

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
