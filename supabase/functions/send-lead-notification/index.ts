import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.8.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type BuyerInfo = {
  id: string;
  full_name: string;
  phone: string;
};

type LeadInfo = {
  id: string;
  type: string;
  location: string;
  price: number;
  seller_id: string;
  seller_name?: string;
  description?: string;
};

/**
 * Formats a phone number to E.164 format for use with Twilio
 * @param phoneNumber The phone number to format
 * @returns Phone number in E.164 format (e.g., +12125551234)
 */
function formatPhoneToE164(phoneNumber: string): string {
  if (!phoneNumber) return '';
  
  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, '');
  
  // If it already has a plus sign, ensure it's correctly formatted
  if (phoneNumber.startsWith('+')) {
    // If it's already in E.164 format, return it
    if (/^\+\d{10,15}$/.test(phoneNumber)) {
      return phoneNumber;
    }
    // Otherwise, just extract the digits and format properly
  }
  
  // Check if it already has a country code (assuming +1 for US would be 11 digits starting with 1)
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }
  
  // If it's a 10-digit number, assume it's a US number and add +1
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  
  // Default to prefixing with +1 if we can't determine format
  // This might not work for non-US numbers but ensures Twilio gets a prefixed number
  return digits.length > 0 ? `+1${digits}` : '';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the request body
    let requestData;
    try {
      requestData = await req.json();
    } catch (error) {
      console.error("Error parsing request body:", error);
      return new Response(
        JSON.stringify({ error: "Invalid request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { leadId } = requestData;
    
    if (!leadId) {
      return new Response(
        JSON.stringify({ error: "Lead ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client with the Supabase URL and anon key from env vars
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") as string;
    const twilio_account_sid = Deno.env.get("TWILIO_ACCOUNT_SID") as string;
    const twilio_auth_token = Deno.env.get("TWILIO_AUTH_TOKEN") as string;
    const twilio_from_number = Deno.env.get("TWILIO_FROM_NUMBER") as string;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Missing Supabase environment variables");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!twilio_account_sid || !twilio_auth_token || !twilio_from_number) {
      console.error("Missing Twilio environment variables");
      return new Response(
        JSON.stringify({ error: "SMS service configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Get the lead details
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('id, type, location, price, seller_id, seller_name, description')
      .eq('id', leadId)
      .single();

    if (leadError || !lead) {
      console.error("Error fetching lead:", leadError);
      return new Response(
        JSON.stringify({ error: "Lead not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get buyers who have notifications enabled
    const { data: buyers, error: buyersError } = await supabase
      .from('profiles')
      .select('id, full_name, phone')
      .eq('role', 'buyer') // Only buyers
      .eq('sms_notifications_enabled', true) // Only those with SMS notifications enabled
      .not('phone', 'is', null); // Only those with phone numbers

    if (buyersError) {
      console.error("Error fetching buyers:", buyersError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch notification recipients" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!buyers || buyers.length === 0) {
      console.log("No buyers with notifications enabled found");
      return new Response(
        JSON.stringify({ message: "No notification recipients found" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${buyers.length} buyers eligible for SMS notifications`);

    // Send SMS notifications to buyers
    const sendResults = await Promise.allSettled(
      buyers.map(async (buyer) => {
        if (!buyer.phone) return null;
        
        // Format buyer phone to ensure E.164 format
        const formattedPhone = formatPhoneToE164(buyer.phone);
        console.log(`Buyer ${buyer.id} phone: ${buyer.phone} -> Formatted: ${formattedPhone}`);
        
        // Skip if we couldn't format to a valid phone number
        if (!formattedPhone) {
          console.error(`Could not format phone number for buyer ${buyer.id}: ${buyer.phone}`);
          return {
            buyerId: buyer.id,
            status: 'error',
            error: 'Invalid phone number format'
          };
        }
        
        // Format message
        const message = `New lead alert! A ${lead.type} lead in ${lead.location} is now available for $${lead.price}. Log in to the marketplace to view details.`;
        
        try {
          console.log(`Sending SMS to ${formattedPhone} via Twilio`);
          
          // Call Twilio API to send SMS
          const twilioEndpoint = `https://api.twilio.com/2010-04-01/Accounts/${twilio_account_sid}/Messages.json`;
          
          const formData = new URLSearchParams();
          formData.append('To', formattedPhone);
          formData.append('From', twilio_from_number);
          formData.append('Body', message);
          
          const twilioResponse = await fetch(twilioEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': 'Basic ' + btoa(`${twilio_account_sid}:${twilio_auth_token}`)
            },
            body: formData
          });
          
          const twilioData = await twilioResponse.json();
          
          // Log SMS sending status
          console.log(`SMS notification sent to buyer ${buyer.id}: ${twilioResponse.status}`);
          if (twilioResponse.status >= 400) {
            console.error(`Twilio error response: ${JSON.stringify(twilioData)}`);
          }
          
          return {
            buyerId: buyer.id,
            status: twilioResponse.status,
            phoneUsed: formattedPhone,
            smsId: twilioData.sid || null,
            error: twilioData.error_code ? 
              `${twilioData.error_code}: ${twilioData.error_message}` : 
              null
          };
        } catch (error) {
          console.error(`Error sending SMS to buyer ${buyer.id}:`, error);
          return {
            buyerId: buyer.id,
            status: 'error',
            phoneUsed: formattedPhone,
            error: error.message
          };
        }
      })
    );

    // Count successful sends
    const successful = sendResults.filter(
      result => result.status === 'fulfilled' && 
        result.value?.status >= 200 && 
        result.value?.status < 300
    ).length;

    console.log(`SMS notifications sent successfully to ${successful} out of ${buyers.length} buyers`);

    return new Response(
      JSON.stringify({
        message: `SMS notifications sent to ${successful} out of ${buyers.length} buyers`,
        details: sendResults
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
