
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Import refactored modules
import { createEmailService, sendEmail } from "./email-service.ts";
import { generateLeadEmailHtml, generateLeadEmailSubject } from "./email-templates.ts";
import { 
  corsHeaders, 
  createJsonResponse, 
  formatCurrency, 
  formatDate 
} from "./utils.ts";

// Initialize services
const resend = createEmailService();

// Initialize Supabase client with admin privileges
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface LeadEmailNotificationRequest {
  leadId: string;
}

async function fetchLeadDetails(leadId: string) {
  const { data: lead, error: leadError } = await supabase
    .from('leads')
    .select('*, profiles!leads_seller_id_fkey(full_name, company)')
    .eq('id', leadId)
    .single();
  
  if (leadError || !lead) {
    console.error("Error fetching lead:", leadError);
    throw new Error(leadError?.message || "Lead not found");
  }
  
  return lead;
}

async function fetchActiveBuyers() {
  const { data: buyers, error: buyersError } = await supabase.rpc('get_active_buyer_emails');
  
  if (buyersError) {
    console.error("Error fetching buyers:", buyersError);
    throw new Error(buyersError.message);
  }
  
  return buyers || [];
}

async function processLeadNotification(leadId: string) {
  // Fetch the lead details
  const lead = await fetchLeadDetails(leadId);
  
  // Get all active buyers who have enabled email notifications
  const buyers = await fetchActiveBuyers();
  
  if (buyers.length === 0) {
    console.log("No buyers found with email notifications enabled");
    return { message: "No buyers to notify", results: [] };
  }
  
  // Format the lead data for display in email
  const formattedPrice = formatCurrency(lead.price);
  const creationDate = formatDate(lead.created_at);
  
  // Create email content
  const emailSubject = generateLeadEmailSubject(lead);
  const emailHtml = generateLeadEmailHtml(lead, formattedPrice, creationDate, supabaseUrl);
  
  // Send emails to all buyers
  const emailResults = [];
  for (const buyer of buyers) {
    const result = await sendEmail(resend, buyer.email, emailSubject, emailHtml);
    
    emailResults.push({
      buyer: buyer.id,
      email: buyer.email,
      ...result
    });
  }
  
  return {
    message: `Notification sent to ${emailResults.filter(r => r.success).length} buyers`,
    results: emailResults
  };
}

// Main request handler
serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { leadId } = await req.json() as LeadEmailNotificationRequest;

    if (!leadId) {
      return createJsonResponse({ error: "Lead ID is required" }, 400);
    }

    const result = await processLeadNotification(leadId);
    return createJsonResponse(result);

  } catch (error) {
    console.error("Error in send-lead-email-notification function:", error);
    return createJsonResponse({ error: error.message }, 500);
  }
});
